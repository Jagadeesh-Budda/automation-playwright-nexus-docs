(function () {
    "use strict";

    // ═══════════════════════════════════════════════════════════════
    // CENTRALIZED LUCIDE ICON RENDERING ENGINE
    // Ensures icons are always rendered after dynamic DOM injection
    // ═══════════════════════════════════════════════════════════════
    
    let _iconRenderTimer = null;

    /**
     * Safe wrapper for lucide.createIcons() — debounced to prevent
     * redundant calls during rapid DOM mutations.
     */
    function renderIcons() {
        if (_iconRenderTimer) clearTimeout(_iconRenderTimer);
        _iconRenderTimer = setTimeout(_doRenderIcons, 50);
    }

    function _doRenderIcons() {
        if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            try {
                lucide.createIcons();
            } catch (e) {
                console.warn('[MasteryPortal] Icon rendering error:', e);
            }
        }
    }

    /**
     * MutationObserver: Watches for new <i data-lucide="..."> elements
     * injected into the DOM and auto-triggers icon conversion.
     */
    function _initIconObserver() {
        if (typeof MutationObserver === 'undefined') return;
        const observer = new MutationObserver(function(mutations) {
            let hasNewIcons = false;
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            if ((node.tagName === 'I' && node.hasAttribute('data-lucide')) ||
                                node.querySelector?.('i[data-lucide]')) {
                                hasNewIcons = true;
                                break;
                            }
                        }
                    }
                }
                if (hasNewIcons) break;
            }
            if (hasNewIcons) renderIcons();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    // Start the observer immediately
    _initIconObserver();

    const SALT = "asa_mastery_secure_v2";

    // Enterprise Sync & Verification Configuration
    const SYNC_CONFIG = {
        enabled: false,
        endpoint: "", 
        verifyEndpoint: 'https://api.asa-authority.com/v1/verify-cert', // Industrial Verification Handshake
        apiKey: "",
        syncInterval: 30000 
    };

    const computeSignature = (state) => {
        const str = JSON.stringify({ ...state, _sig: undefined }) + SALT;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString(36);
    };

    /**
     * SHA-256 Helper for Industrial Digital Signatures
     */
    const sha256 = async (message) => {
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const MasteryStore = {
        key: 'ASA_mastery_state',
        get() {
            try {
                const stateStr = localStorage.getItem(this.key);
                const defaultState = this.getDefault();
                if (!stateStr) return defaultState;

                const state = JSON.parse(stateStr);
                const currentSig = state._sig;
                if (currentSig !== computeSignature(state)) {
                    console.warn("x⚠ Integrity Violation: State tampering detected. Resetting to secure state.");
                    return defaultState;
                }

                return { ...defaultState, ...state };
            } catch (e) {
                console.error("MasteryStore corruption detected. Resetting.");
                return this.getDefault();
            }
        },
        getDefault() {
            return {
                user: { name: '', id: '' },
                completed: [],
                attempts: {},
                scores: {},
                tasks: {},
                analytics: {},
                skills: {},
                failureLog: {},
                startTime: Date.now()
            };
        },
        async save(state) {
            state._sig = computeSignature(state);
            localStorage.setItem(this.key, JSON.stringify(state));

            // Trigger UI updates
            if (window.initProgress) window.initProgress();
            
            // Re-apply gatekeeping if on dashboard
            const s = MasteryStore.get();
            applyGatekeeping(s);

            // Sync to Secure Backend
            try {
                const token = localStorage.getItem('asa_auth_token');
                const userId = state.user.id || state.user.name; // Fallback
                
                await fetch('http://localhost:3000/api/progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : '',
                        'x-user-id': userId
                    },
                    body: JSON.stringify({ state })
                });
                this.updateSyncStatus(true);
            } catch (e) {
                console.warn("Backend Sync Failed. Working in Offline Mode.", e);
                this.updateSyncStatus(false);
            }
        },
        async fetchFromBackend() {
            try {
                const token = localStorage.getItem('asa_auth_token');
                // Use existing user from localStorage as fallback ID if no token
                const localState = JSON.parse(localStorage.getItem(this.key) || '{}');
                const userId = (localState.user && localState.user.id) || (localState.user && localState.user.name);

                if (!token && !userId) return; // Completely new user, nothing to fetch

                const res = await fetch('http://localhost:3000/api/progress', {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'x-user-id': userId
                    }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.progress) {
                        // Hydrate local cache with secure backend truth
                        localStorage.setItem(this.key, JSON.stringify(data.progress));
                        this.updateSyncStatus(true);
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch progress from backend", e);
            }
        },
        updateSyncStatus(isOnline) {
            const el = document.getElementById('sync-status-indicator');
            if (el) {
                el.innerHTML = isOnline ? '<i data-lucide="cloud-check" style="color: var(--accent)"></i>' : '<i data-lucide="cloud-off" style="color: var(--text-muted)"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        },
        updateSkills(moduleId, objectives) {
            const state = this.get();
            objectives.forEach(obj => {
                const current = state.skills[obj.id] || 0;
                state.skills[obj.id] = Math.min(100, current + 20);
            });
            this.save(state);
        },
        completeModule(moduleId, score, failedObjectives = []) {
            const state = this.get();
            const module = learningModules.find(m => m.id === moduleId);
            if (!state.completed.includes(moduleId)) {
                state.completed.push(moduleId);
                if (module) this.updateSkills(moduleId, module.objectives);
            }
            state.scores[moduleId] = Math.max(state.scores[moduleId] || 0, score);
            state.analytics[moduleId] = state.analytics[moduleId] || { weakAreas: [], passCount: 0, failCount: 0 };
            if (score >= 70) state.analytics[moduleId].passCount++;
            else state.analytics[moduleId].failCount++;
            if (failedObjectives.length > 0) {
                state.analytics[moduleId].weakAreas = [...new Set([...state.analytics[moduleId].weakAreas, ...failedObjectives])];
            }
            this.save(state);
        },
        toggleTask(moduleId, taskId) {
            const state = this.get();
            if (!state.tasks[moduleId]) state.tasks[moduleId] = [];
            const id = state.tasks[moduleId].indexOf(taskId);
            if (id > -1) state.tasks[moduleId].splice(idx, 1);
            else state.tasks[moduleId].push(taskId);
            this.save(state);
        },
        getAttempts(moduleId) {
            return this.get().attempts[moduleId] || { count: 0, last: 0 };
        },
        recordAttempt(moduleId) {
            const state = this.get();
            const current = state.attempts[moduleId] || { count: 0, last: 0 };
            state.attempts[moduleId] = { count: current.count + 1, last: Date.now() };
            this.save(state);
        },
        logFailure(moduleId, ruleId) {
            const state = this.get();
            state.failureLog[moduleId] = state.failureLog[moduleId] || {};
            state.failureLog[moduleId][ruleId] = (state.failureLog[moduleId][ruleId] || 0) + 1;
            this.save(state);
        },
        resetModule(moduleId) {
            const state = this.get();
            delete state.attempts[moduleId];
            delete state.scores[moduleId];
            state.completed = state.completed.filter(id => id !== moduleId);
            if (state.tasks[moduleId]) delete state.tasks[moduleId];
            if (state.analytics[moduleId]) delete state.analytics[moduleId];
            this.save(state);
        },
        downloadBackup() {
            const state = this.get();
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ASA_mastery_backup_${state.user.name.replace(/\s+/g, '_') || 'user'}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },
        async restoreBackup(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const state = JSON.parse(e.target.result);
                        if (state._sig === computeSignature(state)) {
                            this.save(state);
                            resolve(true);
                        } else {
                            reject("x⚠ Invalid Backup Signature: Integrity Check Failed.");
                        }
                    } catch (err) {
                        reject("Failed to parse backup file.");
                    }
                };
                reader.readAsText(file);
            });
        },
        calculateOverallMastery() {
            const state = this.get();
            let totalWeight = 0;
            let earnedWeight = 0;
            learningModules.forEach(module => {
                const weight = module.weight || 10;
                totalWeight += weight;
                if (state.completed.includes(module.id)) earnedWeight += weight;
            });
            return Math.round((earnedWeight / totalWeight) * 100);
        }
    };

    const AttemptManager = {
        get(moduleId) { return MasteryStore.getAttempts(moduleId); },
        record(moduleId) { MasteryStore.recordAttempt(moduleId); },
        reset(moduleId) { MasteryStore.resetModule(moduleId); },
        canAttempt(moduleId) {
            const attempt = this.get(moduleId);
            if (attempt.count < 3) return true;
            const COOLDOWN = 10 * 60 * 1000;
            return (Date.now() - attempt.last) > COOLDOWN;
        }
    };

    let learningModules = [];
    let searchIndex = [];

    async function loadModules() {
        const prefix = getRootPrefix();
        const registryPath = prefix + 'assets/modules.json';
        const indexPath = prefix + 'assets/search_index.json';

        try {
            const [regRes, indexRes] = await Promise.all([
                fetch(registryPath),
                fetch(indexPath).catch(() => null)
            ]);

            if (regRes.ok) learningModules = await regRes.json();
            if (indexRes && indexRes.ok) searchIndex = await indexRes.json();
        } catch (e) {
            console.error("Registry load failed:", e);
        }
    }

    // Utility to get relative path to root (docs/)
    function getRootPrefix() {
        const path = window.location.pathname;
        if (path.includes('/modules/')) return '../../';
        return '';
    }

    /**
     * INDUSTRIAL AST VALIDATOR 2.0: Deep Synta Tree Inspection
     */
    const CodeValidator = {
        parse(code) {
            try {
                // Ensure the code is wrapped if it's just a fragment (like many student submissions)
                const wrapped = code.includes('async') ? code : `async function validate() { ${code} }`;
                return acorn.parse(wrapped, { ecmaVersion: 2022, sourceType: "module" });
            } catch (e) {
                return { error: e.message };
            }
        },
        traverse(node, callback) {
            if (!node) return;
            callback(node);
            for (let key in node) {
                const child = node[key];
                if (child && typeof child === 'object') {
                    if (Array.isArray(child)) {
                        child.forEach(c => this.traverse(c, callback));
                    } else if (child.type) {
                        this.traverse(child, callback);
                    }
                }
            }
        },
        validate(code, rules) {
            const ast = this.parse(code);
            const hasAstRules = rules.some(r => ['hasCall', 'hasFixture', 'hasAwait', 'noSleep'].includes(r.type));

            const results = rules.map(rule => {
                let pass = false;

                // 1. Text-based rules (Don't require AST)
                if (rule.type === 'contains') {
                    pass = code.includes(rule.value);
                } else if (rule.type === 'pattern') {
                    pass = new RegExp(rule.value, 'i').test(code);
                } 
                // 2. AST-based rules (Require valid parse)
                else if (!ast.error) {
                    if (rule.type === 'hasCall') {
                        this.traverse(ast, (node) => {
                            if (node.type === 'CallExpression') {
                                const callee = node.callee;
                                const name = callee.name || (callee.property && callee.property.name);
                                if (name && name.toLowerCase() === rule.value.toLowerCase()) pass = true;
                            }
                        });
                    }

                    if (rule.type === 'hasFixture') {
                        this.traverse(ast, (node) => {
                            if (node.type === 'ObjectPattern' || node.type === 'VariableDeclarator') {
                                const props = node.properties || (node.id && node.id.properties);
                                if (props && props.some(p => p.key && p.key.name === rule.value)) pass = true;
                            }
                        });
                    }

                    if (rule.type === 'hasAwait') {
                        this.traverse(ast, (node) => {
                            if (node.type === 'AwaitExpression') pass = true;
                        });
                    }

                    // Industrial Policy: No hardcoded sleeps allowed in ASA framework
                    if (rule.type === 'noSleep') {
                        let hasSleep = false;
                        this.traverse(ast, (node) => {
                            if (node.type === 'CallExpression') {
                                const callee = node.callee;
                                const name = callee.name || (callee.property && callee.property.name);
                                if (['sleep', 'waitForTimeout'].includes(name)) hasSleep = true;
                            }
                        });
                        pass = !hasSleep;
                    }
                }

                return { rule, pass };
            });

            // report synta error ONLY if it blocked an actual AST rule
            if (ast.error && hasAstRules) {
                results.push({ rule: { title: "Synta Integrity" }, pass: false, error: ast.error });
            }

            return { isValid: results.every(r => r.pass), results };
        }
    };
    /**
     * UPDATED QUIZ FACTORY: Supports Code and Fi challenges
     */
    const QuizFactory = {
        render(qObj, qIdx) {
            const type = qObj.type || 'mcq';
            switch (type) {
                case 'mcq': return this.renderMCQ(qObj, qIdx);
                case 'scenario': return this.renderScenario(qObj, qIdx);
                case 'code': return this.renderCodeChallenge(qObj, qIdx);
                case 'fix': return this.renderFixChallenge(qObj, qIdx);
                default: return `<p>Unknown type: ${type}</p>`;
            }
        },
        renderMCQ(q, i) {
            return `<div class="quiz-item" id="quiz-q-${i}"><div class="quiz-type-tag">MCQ ⬢ ${q.difficulty} (${q.weight}pts)</div><div class="quiz-question">${q.q}</div><div class="quiz-options">${q.shuffledOptions.map((opt, oi) => `<button class="quiz-opt" id="opt-${i}-${oi}" onclick="handleOptionSelect(${i}, ${oi})">${opt}</button>`).join('')}</div></div>`;
        },
        renderScenario(q, i) {
            return `<div class="quiz-item scenario-type" id="quiz-q-${i}"><div class="quiz-type-tag">SCENARIO ⬢ ${q.difficulty} (${q.weight}pts)</div><div class="quiz-scenario-context"><i data-lucide="info"></i> ${q.context}</div><div class="quiz-question">${q.q}</div><div class="quiz-options">${q.shuffledOptions.map((opt, oi) => `<button class="quiz-opt" id="opt-${i}-${oi}" onclick="handleOptionSelect(${i}, ${oi})">${opt}</button>`).join('')}</div></div>`;
        },
        renderCodeChallenge(q, i) {
            return `<div class="quiz-item code-type" id="quiz-q-${i}"><div class="quiz-type-tag">PRACTICAL ⬢ ${q.difficulty} (${q.weight}pts)</div><div class="quiz-question">${q.q}</div><div class="quiz-code-editor"><span class="editor-label">T✓ EDITOR</span><textarea class="code-input" id="code-input-${i}" placeholder="${q.placeholder}" oninput="handleCodeInput(${i})"></textarea></div><div class="validation-hint"><i data-lucide="help-circle"></i> ${q.hint}</div></div>`;
        },
        renderFixChallenge(q, i) {
            return `<div class="quiz-item fix-type" id="quiz-q-${i}"><div class="quiz-type-tag">DEBUGGING ⬢ ${q.difficulty} (${q.weight}pts)</div><div class="quiz-question">${q.q}</div><div class="fix-challenge-box"><code>${q.badCode.replace(/\n/g, '<br>')}</code></div><div class="quiz-code-editor"><span class="editor-label">REFACTOR HERE</span><textarea class="code-input" id="code-input-${i}" placeholder="${q.placeholder}" oninput="handleCodeInput(${i})"></textarea></div><div class="validation-hint"><i data-lucide="help-circle"></i> ${q.hint}</div></div>`;
        }
    };

    /**
     * UPDATED ENGINE: Logical validation of code signatures
     */
    const QuizEngine = {
        currentQuestions: [],
        answers: [],
        unlockTime: 0,
        failedTiers: [],

        init(module, weakAreas = []) {
            this.currentQuestions = [];
            const quizPool = module.quizPool || {};
            const tiers = ['Easy', 'Medium', 'Hard'];

            tiers.forEach(tier => {
                let pool = quizPool[tier] || [];

                // ADAPTIVE LOGIC: Prioritize weak areas
                if (weakAreas.length > 0) {
                    const prioritized = pool.filter(q => weakAreas.includes(q.objective));
                    if (prioritized.length > 0) pool = prioritized;
                }

                if (pool.length > 0) {
                    const picked = this.shuffle([...pool])[0];
                    
                    // Lookup weight from module mapping
                    const mapping = (module.quizMapping || []).find(m => m.objective === picked.objective);
                    const weight = mapping ? Math.round(mapping.weight / (pool.length > 0 ? 1 : 1)) : 10; // Default weight

                    this.currentQuestions.push({
                        ...picked,
                        difficulty: tier,
                        weight: weight,
                        shuffledOptions: picked.options ? this.shuffle([...picked.options]) : null,
                    });
                }
            });
            this.answers = new Array(this.currentQuestions.length).fill(null);
            this.unlockTime = Date.now();
        },

        shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },

        select(idx, val) { this.answers[idx] = val; },
        isComplete() { return this.answers.every(a => a !== null && a !== ""); },

        validate() {
            const timeSpent = (Date.now() - this.unlockTime) / 1000;
            const minRequiredTime = Math.min(10, this.currentQuestions.length * 3);
            if (timeSpent < minRequiredTime) return { error: `Suspiciously fast. Threshold: ${minRequiredTime}s.` };

            let totalWeight = 0;
            let earnedWeight = 0;
            const failedObjectives = [];

            const results = this.currentQuestions.map((q, i) => {
                let isCorrect = false;
                if (q.type === 'mcq' || q.type === 'scenario') {
                    isCorrect = q.shuffledOptions[this.answers[i]] === q.a;
                } else if (q.type === 'code' || q.type === 'fix') {
                    const code = this.answers[i];
                    isCorrect = q.requirements.every(req => {
                        if (req === 'await') return /await\s+\w+\(/i.test(code);
                        return code.toLowerCase().includes(req.toLowerCase());
                    });
                }

                totalWeight += q.weight;
                if (isCorrect) {
                    earnedWeight += q.weight;
                } else {
                    failedObjectives.push(q.objective);
                }

                return { questionIndex: i, isCorrect, weight: q.weight, type: q.type, objective: q.objective };
            });

            const score = Math.round((earnedWeight / totalWeight) * 100);
            return { results, score, passed: score >= 70, timeSpent: Math.round(timeSpent), points: `${earnedWeight}/${totalWeight}`, failedObjectives: [...new Set(failedObjectives)] };
        }
    };



    const QuizUI = {
        render(module) {
            const container = document.getElementById('knowledge-check-section');
            if (!container) return;

            if (!AttemptManager.canAttempt(module.id)) {
                const attempt = AttemptManager.get(module.id);
                const remaining = Math.ceil((10 * 60 * 1000 - (Date.now() - attempt.last)) / 1000 / 60);
                container.innerHTML = `
                <div class="quiz-container lock-state">
                    <div class="quiz-header"><i data-lucide="lock"></i> Mastery Gate Locked</div>
                    <p>Too many failed attempts (3/3). Access restricted for <strong>${remaining}m</strong>.</p>
                    <div class="lock-actions">
                        <button class="reset-module-btn" onclick="handleResetModule('${module.id}')"><i data-lucide="refresh-cw"></i> Administrative Reset</button>
                    </div>
                </div>`;
                if (typeof lucide !== 'undefined') lucide.createIcons(); return;
            }

            const attempts = AttemptManager.get(module.id);
            const quizHtml = QuizEngine.currentQuestions.map((q, i) => QuizFactory.render(q, i)).join('<hr class="quiz-divider">');

            container.innerHTML = `
            <div class="mastery-container">
                <div class="quiz-container">
                    <div class="quiz-header"><i data-lucide="shield-check"></i> Mastery Assessment (Attempt ${attempts.count + 1}/3)</div>
                    <div class="anti-cheat-tag"><i data-lucide="zap"></i> Practical Code Validation Enabled</div>
                    ${quizHtml}
                    <div id="quiz-feedback-box"></div>
                    <button id="submit-quiz-btn" class="submit-quiz-btn" onclick="handleFinalSubmit('${module.id}')">Submit Assessment</button>
                </div>
            </div>
        `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        },

        showFeedback(result, moduleId) {
            if (result.error) {
                document.getElementById('quiz-feedback-box').innerHTML = `<div class="quiz-result fail"><h4>Security Alert</h4><p>${result.error}</p></div>`;
                if (typeof lucide !== 'undefined') lucide.createIcons(); return;
            }

            AttemptManager.record(moduleId);
            const attempts = AttemptManager.get(moduleId);

            result.results.forEach(r => {
                const q = QuizEngine.currentQuestions[r.questionIndex];
                if (q.type === 'mcq' || q.type === 'scenario') {
                    q.shuffledOptions.forEach((opt, oi) => {
                        const btn = document.getElementById(`opt-${r.questionIndex}-${oi}`);
                        if (!btn) return;
                        if (opt === q.a) btn.classList.add('correct');
                        else if (opt === q.shuffledOptions[QuizEngine.answers[r.questionIndex]] && !r.isCorrect) btn.classList.add('wrong');
                    });
                } else {
                    const editor = document.getElementById(`quiz-q-${r.questionIndex}`);
                    if (editor) {
                        editor.insertAdjacentHTML('beforeend', `<div class="status-badge ${r.isCorrect ? 'correct' : 'error'}">${r.isCorrect ? '✓ Code Signature Validated' : '✗ Missing Requirements'}</div>`);
                    }
                }
            });

            document.querySelectorAll('.quiz-opt, .code-input').forEach(b => b.disabled = true);
            const submitBtn = document.getElementById('submit-quiz-btn');
            if (submitBtn) submitBtn.style.display = 'none';

            const bo = document.getElementById('quiz-feedback-box');
            const module = learningModules.find(m => m.id === moduleId);
            const state = MasteryStore.get();
            const allTasksDone = (module.tasks || []).every(t => (state.tasks[moduleId] || []).includes(t.id));

            const scorecard = result.results.map(r => `<span class="score-dot ${r.isCorrect ? 'pass' : 'fail'}">${r.isCorrect ? '✓' : '✗'}</span>`).join('');

            if (result.passed) {
                if (allTasksDone) {
                    box.innerHTML = `<div class="quiz-result pass"><h4>Mastery Attained!</h4><div class="scorecard-mini">${scorecard}</div><p>Weighted Score: ${result.score}% (${result.points} pts)</p></div>`;
                    MasteryStore.completeModule(moduleId, result.score);
                    renderNextStep(module);
                } else {
                    box.innerHTML = `<div class="quiz-result warn"><h4>Assessment Passed (Pending Tasks)</h4><div class="scorecard-mini">${scorecard}</div><p>Score: ${result.score}%</p><div class="task-gate-msg">⚠ Finish all Practical Tasks above to achieve official Mastery.</div></div>`;
                }
            } else {
                const isNowLocked = !AttemptManager.canAttempt(moduleId);
                const lockMsg = isNowLocked ? "Cooldown Locked!" : `Attempts: ${attempts.count}/3`;

                // RECOMMENDATION ENGINE + CROS✓ MODULE
                const studyGuide = result.failedObjectives.map(oid => {
                    const obj = module.objectives.find(o => o.id === oid);
                    const recommendation = obj && obj.recommends ? `<br>x� Suggested: <a href="${obj.recommends}.html">${obj.recommends}</a>` : '';
                    return obj ? `<li>Re-read: <strong>${obj.title}</strong>${recommendation}</li>` : '';
                }).join('');

                box.innerHTML = `
                <div class="quiz-result fail">
                    <h4>Assessment Failed</h4>
                    <div class="scorecard-mini">${scorecard}</div>
                    <p>Weighted Score: ${result.score}% ⬢ ${lockMsg}</p>
                    <div class="remediation-box">
                        <h5>Personalized Study Plan:</h5>
                        <ul>${studyGuide}</ul>
                    </div>
                    ${!isNowLocked ? `<button class="retry-btn" onclick="handleRetry('${moduleId}')">Adaptive Retry</button>` : ''}
                </div>`;
                MasteryStore.completeModule(moduleId, result.score, result.failedObjectives);
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };
    window.showTaskValidator = (moduleId, taskId) => {
        const module = learningModules.find(m => m.id === moduleId);
        const task = module.tasks.find(t => t.id === taskId);

        const modalHtml = `
        <div id="validator-modal-backdrop">
            <div id="validator-modal">
                <div class="modal-header">
                    <div class="modal-title-group">
                        <i data-lucide="shield-check" class="header-icon"></i>
                        <h3>Technical Gate: Execution Proof</h3>
                    </div>
                    <button class="close-modal" onclick="closeValidator()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="task-context">
                        <span class="context-label">Validation Target:</span>
                        <strong class="context-value">${task.title}</strong>
                    </div>
                    <p class="instruction-text">Structural validation rules apply. Please paste the execution output or code signature required to verify this implementation layer.</p>
                    <div class="editor-container">
                        <div class="editor-header">PROOFSHEET / TERMINAL OUTPUT</div>
                        <textarea id="task-proof" placeholder="Paste execution results here..."></textarea>
                    </div>
                    <div id="validator-error" class="validation-error-box" style="display:none;">
                        <i data-lucide="alert-octagon"></i>
                        <div class="error-msg">
                            <strong>Validation Refused</strong>
                            <span>Output does not meet the architectural requirements for this module.</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="verify-btn premium" onclick="validateTaskProof('${moduleId}', '${taskId}')">
                        <i data-lucide="zap"></i> Verify Implementation Signature
                    </button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    window.validateTaskProof = async (moduleId, taskId) => {
        const module = learningModules.find(m => m.id === moduleId);
        const proof = document.getElementById('task-proof').value;
        const errorBox = document.getElementById('validator-error');
        const verifyBtn = document.querySelector('.verify-btn');
        const originalBtnHtml = verifyBtn.innerHTML;

        // Show loading state
        errorBox.style.display = 'none';
        verifyBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Analyzing AST...';
        verifyBtn.disabled = true;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        try {
            // Secure Backend Validation
            const response = await fetch('http://localhost:3000/api/validate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: proof })
            });

            const result = await response.json();

            if (result.valid) {
                MasteryStore.toggleTask(moduleId, taskId);
                closeValidator();
                renderModuleHeader();
                initProgress();

                // Dynamic Unlocking of Quiz
                const state = MasteryStore.get();
                const allTasksDone = (module.tasks || []).every(t => (state.tasks[moduleId] || []).includes(t.id));
                if (allTasksDone) {
                    const startBtn = document.getElementById('start-assessment-btn');
                    if (startBtn) {
                        startBtn.disabled = false;
                        startBtn.classList.remove('locked');
                        startBtn.innerHTML = `<i data-lucide="play"></i> Unlock Mastery Assessment`;
                        if (typeof lucide !== 'undefined') lucide.createIcons();
                    }
                }
            } else {
                errorBox.style.display = 'block';
                const errorMsg = errorBox.querySelector('.error-msg span');
                // Display the specific architectural issues returned by the backend
                if (errorMsg && result.issues && result.issues.length > 0) {
                    errorMsg.innerHTML = result.issues.map(i => `• ${i}`).join('<br>');
                } else if (errorMsg) {
                    errorMsg.innerText = "Output does not meet the architectural requirements for this module.";
                }
                
                // Log failure for analytics
                MasteryStore.logFailure(moduleId, "backend_ast_rejection");
            }
        } catch (err) {
            console.error("Backend validation failed:", err);
            errorBox.style.display = 'block';
            const errorMsg = errorBox.querySelector('.error-msg span');
            if (errorMsg) errorMsg.innerText = "Could not reach the Authority Server. Make sure the backend is running.";
        } finally {
            verifyBtn.innerHTML = originalBtnHtml;
            verifyBtn.disabled = false;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };

    window.closeValidator = () => {
        const modal = document.getElementById('validator-modal-backdrop');
        if (modal) modal.remove();
    };

    window.handleOptionSelect = (qIdx, oIdx) => {
        const selectedText = QuizEngine.currentQuestions[qIdx].shuffledOptions[oIdx];
        QuizEngine.select(qIdx, selectedText);
        document.querySelectorAll(`#quiz-q-${qIdx} .quiz-opt`).forEach((b, i) => b.classList.toggle('selected', i === oIdx));
    };

    window.handleCodeInput = (qIdx) => {
        const val = document.getElementById(`code-input-${qIdx}`).value;
        QuizEngine.select(qIdx, val);
    };

    window.handleFinalSubmit = async (moduleId) => {
        if (!QuizEngine.isComplete()) return alert("Answer all questions.");
        
        // 1. Show loading state on button
        const submitBtn = document.querySelector('.quiz-submit-btn');
        const originalText = submitBtn ? submitBtn.innerHTML : 'Submit Assessment';
        if (submitBtn) {
            submitBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Verifying with Authority...`;
            submitBtn.disabled = true;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        try {
            // 2. Fetch answers stored in QuizEngine and map them to question text
            const answers = {};
            QuizEngine.answers.forEach((ans, idx) => {
                const questionText = QuizEngine.currentQuestions[idx].q;
                answers[questionText] = ans;
            });

            // 3. Send payload to secure Node.js backend
            const response = await fetch('http://localhost:3000/api/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moduleId, answers })
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const result = await response.json();

            // 4. Map backend response to QuizUI feedback format
            const formattedResult = {
                score: result.score,
                failedObjectives: []
            };

            // Map INCORRECT details to failed objectives if needed
            for (const [qId, status] of Object.entries(result.details)) {
                if (status === 'INCORRECT') {
                    // Find the objective associated with this question
                    const module = learningModules.find(m => m.id === moduleId);
                    let obj = 'general';
                    // Deep search quizPool to find objective (Fallback)
                    Object.values(module.quizPool).forEach(level => {
                        const q = level.find(q => q.q === qId);
                        if (q) obj = q.objective;
                    });
                    if (!formattedResult.failedObjectives.includes(obj)) {
                        formattedResult.failedObjectives.push(obj);
                    }
                }
            }

            // 5. Hand back to UI
            QuizUI.showFeedback(formattedResult, moduleId);

        } catch (error) {
            console.error("Authority Engine Error:", error);
            alert("Failed to securely verify assessment. Make sure backend is running.");
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
    };

    function renderModuleHeader() {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'index.html';
        if (currentFile === 'index.html') return; // Skip on dashboard

        const currentPage = learningModules.find(p => {
            const normalizedPath = currentPath.replace('.html', '');
            const normalizedUrl = p.url.replace('.html', '');
            return normalizedPath.endsWith(normalizedUrl);
        });
        if (!currentPage || !currentPage.meta) return;

        const anchor = document.getElementById('page-content-anchor');
        if (!anchor) return;

        const state = MasteryStore.get();
        const completedTasks = state.tasks[currentPage.id] || [];

        const headerHtml = `
        <div class="module-header-enterprise">
            <div class="module-meta-grid">
                <div class="meta-card"><i data-lucide="clock"></i><div class="meta-info"><span class="meta-label">Est. Time</span><span class="meta-value">${currentPage.meta.time}</span></div></div>
                <div class="meta-card"><i data-lucide="bar-chart"></i><div class="meta-info"><span class="meta-label">Status</span><span class="meta-value">${state.completed.includes(currentPage.id) ? 'Mastered' : 'In Progress'}</span></div></div>
                <div class="meta-card"><i data-lucide="target"></i><div class="meta-info"><span class="meta-label">Type</span><span class="meta-value">${currentPage.meta.type}</span></div></div>
            </div>

            <div class="module-objectives">
                <h3><i data-lucide="check-square"></i> Mastery Objectives</h3>
                <ul class="objective-list">
                    ${currentPage.objectives.map(obj => `<li>${obj.title}</li>`).join('')}
                </ul>
            </div>

            <div class="module-tasks">
                <h3><i data-lucide="terminal"></i> Practical Tasks (Execution Layer)</h3>
                <div class="task-grid">
                    ${currentPage.tasks.map(task => {
            const isDone = completedTasks.includes(task.id);
            return `
                            <div class="task-item ${isDone ? 'done' : ''}" onclick="${isDone ? '' : `showTaskValidator('${currentPage.id}', '${task.id}')`}">
                                <div class="task-check">${isDone ? '' : '9'}</div>
                                <div class="task-info">
                                    <strong>${task.title}</strong>
                                    <div class="task-requirements">
                                        <span class="req-label">Required Signature:</span>
                                        <code>${task.hint}</code>
                                    </div>
                                    <span class="validator-hint">Status: ${isDone ? 'Validated' : 'Pending Verification'}</span>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>

            <div class="module-spec-box">
                <h3><i data-lucide="shield-check"></i> Skill Traceability</h3>
                <div class="trace-list">
                    ${currentPage.quizMapping.map(map => `
                        <div class="trace-pill">Validated: ${map.objective} (${map.weight}%)</div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

        const wrapper = document.createElement('div');
        wrapper.id = "module-header-wrapper";
        wrapper.className = "mastery-container"; // Align with content blocks
        const existing = document.getElementById('module-header-wrapper');
        if (existing) existing.remove();

        wrapper.innerHTML = headerHtml;
        anchor.prepend(wrapper);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function initProgress() {
        const page = learningModules.find(p => {
            const normalizedPath = window.location.pathname.replace('.html', '');
            const normalizedUrl = p.url.replace('.html', '');
            return normalizedPath.endsWith(normalizedUrl);
        });
        if (!page) return;

        const state = MasteryStore.get();
        const isCompleted = state.completed.includes(page.id);

        // Sync sidebar progress bar
        const progress = MasteryStore.calculateOverallMastery(); // x⚠ Use Weighted Logic
        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('progress-percent');
        if (fill) fill.style.width = `${progress}%`;
        if (text) text.textContent = `${progress}%`;

        const footerActions = document.getElementById('page-footer-actions');
        if (footerActions) {
            footerActions.innerHTML = `
            <div id="scroll-lock-notice" class="scroll-notice"><i data-lucide="lock"></i> Read to the end to unlock Mastery Challenge</div>
            <div id="mark-complete" class="complete-btn ${isCompleted ? 'active' : ''}" style="display:none">
                <i data-lucide="${isCompleted ? 'check-circle-2' : 'circle'}"></i>
                <span>${isCompleted ? 'Mastered' : 'Complete Challenge to Master'}</span>
            </div>`;
        }

        if (isCompleted) {
            if (document.getElementById('scroll-lock-notice')) document.getElementById('scroll-lock-notice').style.display = 'none';
            if (document.getElementById('mark-complete')) document.getElementById('mark-complete').style.display = 'flex';
            renderNextStep(page);
        } else {
            const contentArea = document.getElementById('content');
            if (contentArea) {
                const onScroll = () => {
                    const scrollHeight = contentArea.scrollHeight;
                    const scrollTop = contentArea.scrollTop;
                    const clientHeight = contentArea.clientHeight;
                    const scrollPercent = (scrollTop + clientHeight) / scrollHeight;
                    
                    if (scrollPercent > 0.85) {
                        unlockKnowledgeCheck(page);
                        contentArea.removeEventListener('scroll', onScroll);
                    }
                };
                contentArea.addEventListener('scroll', onScroll);
            }
        }
        checkLevelLock();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function checkLevelLock() {
        const state = MasteryStore.get();
        const currentPath = window.location.pathname;
        const currentPage = learningModules.find(p => currentPath.endsWith(p.url));
        if (!currentPage || currentPage.level <= 1) return;

        const requiredModules = learningModules.filter(p => p.level < currentPage.level);
        const missing = requiredModules.filter(m => !state.completed.includes(m.id));
        if (missing.length > 0) lockPage(missing);
    }

    window.handleRetry = (moduleId) => {
        const module = learningModules.find(p => p.id === moduleId);
        const state = MasteryStore.get();
        const weakAreas = state.analytics[moduleId]?.weakAreas || [];

        QuizEngine.init(module, weakAreas);
        QuizUI.render(module);
        document.getElementById('knowledge-check-section').scrollIntoView({ behavior: 'smooth' });
    };

    // Global Initialization - Must be called after Markdown rendering
    window.initPortal = async () => {
        await loadModules();
        
        // 1. Hydrate state from secure backend API (Replaces local-only trust)
        await MasteryStore.fetchFromBackend();
        
        // x⚠ CRITICAL: Early Security Check
        // Check access BEFORE rendering any UI or content to prevent "flicker" access
        const isBlocked = checkGlobalAccess();
        if (isBlocked) return; // Halt portal initialization immediately

        // 1. Check for incoming Mobile Sync
        const hash = window.location.hash;
        if (hash && hash.startsWith('#sync=')) {
            try {
                const encodedData = hash.replace('#sync=', '');
                const decodedState = JSON.parse(atob(encodedData));
                // Verify signature by trying to save it (it will be checked on next get)
                MasteryStore.save(decodedState);
                window.location.hash = ''; // Clear hash
                alert("x Success: Mastery Progress Synced from Laptop!");
            } catch (e) {
                console.error("Mobile Sync Failed:", e);
                alert("Sync Failed: Invalid or Corrupted Data.");
            }
        }


        initLayout();
        initUser();
        renderNav();
        renderModuleHeader();
        initThemeToggle();
        initSearch();
        initBreadcrumbs();
        initCommandPalette();
        initCopyButtons();
        initTOC();
        initTabs();
        initMermaid();
        initProgress();
        initDashboard();
        initASTPlayground();

        // ⚠ UNIVERSAL GATEKEEPER: Apply to all links on the current page
        applyGatekeeping(MasteryStore.get());

        // Final icon rendering pass — ensures all dynamically injected icons are converted
        renderIcons();
    };

    function initCopyButtons() {
        document.querySelectorAll('pre').forEach(pre => {
            // Skip mermaid blocks
            if (pre.querySelector('code.language-mermaid')) return;
            
            // Check if already wrapped to avoid double-init
            if (pre.parentElement.classList.contains('code-block-wrapper')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);
            
            const btn = document.createElement('button');
            btn.innerHTML = '<i data-lucide="copy"></i>';
            btn.className = 'copy-btn';
            btn.setAttribute('title', 'Copy code');
            
            btn.addEventListener('click', () => {
                const code = pre.querySelector('code').innerText;
                navigator.clipboard.writeText(code);
                
                btn.innerHTML = '<i data-lucide="check"></i>';
                btn.classList.add('copied');
                
                setTimeout(() => {
                    btn.innerHTML = '<i data-lucide="copy"></i>';
                    btn.classList.remove('copied');
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }, 2000);
                
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
            
            wrapper.appendChild(btn);
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }


    function initMermaid() {
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({ startOnLoad: false, theme: document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'default', securityLevel: 'loose' });
            renderMermaid();
        }
    }

    async function renderMermaid() {
        const codeBlocks = document.querySelectorAll('pre code.language-mermaid');
        for (const codeBlock of codeBlocks) {
            const pre = codeBlock.parentElement;
            const source = codeBlock.innerText;
            const container = document.createElement('div');
            container.classList.add('mermaid-container');
            pre.parentElement.replaceChild(container, pre);
            try {
                const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, source);
                container.innerHTML = `<div class="mermaid-svg-wrapper">${svg}</div>`;
            } catch (e) {
                container.innerHTML = `<p style="color:red">Mermaid Render Error</p>`;
            }
        }
    }

    function unlockKnowledgeCheck(page) {
        const notice = document.getElementById('scroll-lock-notice');
        if (notice) notice.style.display = 'none';

        const container = document.getElementById('knowledge-check-section');
        const state = MasteryStore.get();
        const allTasksDone = (page.tasks || []).every(t => (state.tasks[page.id] || []).includes(t.id));

        container.innerHTML = `
        <div class="mastery-container">
            <div class="assessment-gate-card">
                <div class="gate-icon"><i data-lucide="shield-check"></i></div>
                <div class="gate-content">
                    <h3>Mastery Assessment Gate</h3>
                    <p>Technical content reviewed. You are now eligible for the final validation challenge.</p>
                </div>
                <button id="start-assessment-btn" class="assessment-unlock-btn ${allTasksDone ? '' : 'locked'}" ${allTasksDone ? '' : 'disabled'}>
                    <i data-lucide="${allTasksDone ? 'play' : 'lock'}"></i> 
                    ${allTasksDone ? 'Start Mastery Assessment' : 'Practical Tasks Pending'}
                </button>
            </div>
        </div>`;

            if (allTasksDone) {
                document.getElementById('start-assessment-btn').onclick = () => {
                    QuizEngine.init(page);
                    QuizUI.render(page);
                };
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

    function initLayout() {
        if (document.getElementById('sidebar')) return; // Prevent double init

        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'index.html';
        const isDashboard = currentFile === 'index.html';

        // Step 1: Grab the rendered content from the page's content div
        const sourceEl = document.getElementById('content') || document.getElementById('rendered-content');
        const fragment = document.createDocumentFragment();
        if (sourceEl) {
            while (sourceEl.firstChild) {
                fragment.appendChild(sourceEl.firstChild);
            }
        }

        // Step 2: Clear body completely
        document.body.innerHTML = '';

        // Step 3: Build sidebar
        const sidebar = document.createElement('div');
        sidebar.id = 'sidebar';
        sidebar.innerHTML = `
        <a href="${getRootPrefix()}index.html" class="sidebar-header">
            <img src="${getRootPrefix()}original-logo.png" alt="SP✓ Logo" class="brand-logo">
            <h2>Mastery Portal</h2>
        </a>
        <div id="nav-container">
            <div class="nav-group-header">
                <span class="nav-status-dot" style="background: var(--accent)"></span>
                <span class="nav-group-title">Main Navigation</span>
            </div>
            <a href="${getRootPrefix()}index.html" class="nav-link ${currentFile === 'index.html' ? 'active' : ''}">
                <i data-lucide="home" class="nav-icon"></i>
                <span class="nav-link-text">Dashboard Home</span>
            </a>
        </div>
        <div class="sidebar-footer">
            <div class="progress-label"><span>Mastery Progress</span><span id="progress-percent">0%</span></div>
            <div class="progress-bar-bg"><div id="progress-fill" class="progress-bar-fill"></div></div>
            <button id="export-report" class="export-btn"><i data-lucide="download"></i> Export Progress</button>
        </div>`;
        document.body.appendChild(sidebar);

        // Step 4: Build main wrapper
        const mainWrapper = document.createElement('div');
        mainWrapper.id = 'main-wrapper';

        // Header
        const header = document.createElement('div');
        header.id = 'header';
        header.innerHTML = `
        <div class="header-search-wrapper" style="display:flex; align-items:center;">
            <button id="hamburger" title="Toggle Sidebar"><i data-lucide="menu"></i></button>
            <img src="${getRootPrefix()}original-logo.png" alt="Logo" class="brand-logo mobile-logo" style="display:none; height:24px; margin-left:10px;">
        </div>
        <div class="search-container">
            <input type="text" id="search-input" placeholder="Search docs..." autocomplete="off">
            <div id="search-results"></div>
            <span style="position:absolute; right:15px; top:12px; font-size:0.7rem; color:var(--text-muted); border:1p solid var(--border-color); padding:2p 5px; border-radius:4px; pointer-events:none;">Ctrl K</span>
        </div>
        <div class="header-actions">
            <div id="sync-status-indicator" title="Cloud Sync Status" style="margin-right: 15px; display: flex; align-items: center;"></div>
            <button id="voice-toggle" title="Listen to Page Content" class="action-btn"><i data-lucide="volume-2"></i></button>
            <button id="theme-toggle" class="action-btn"><i data-lucide="moon"></i></button>
        </div>`;
        mainWrapper.appendChild(header);

        // Content wrapper (grid)
        const contentWrapper = document.createElement('div');
        contentWrapper.id = 'content-wrapper';
        if (isDashboard) contentWrapper.classList.add('dashboard-layout');

        // Content area
        const contentDiv = document.createElement('div');
        contentDiv.id = 'content';

        // Inner container for controlled width/alignment
        const contentInner = document.createElement('div');
        contentInner.className = 'content-inner';

        if (!isDashboard) {
            const breadcrumbs = document.createElement('div');
            breadcrumbs.id = 'breadcrumbs';
            breadcrumbs.className = 'mastery-container';
            contentInner.appendChild(breadcrumbs);

            const lockBanner = document.createElement('div');
            lockBanner.id = 'level-lock-banner';
            lockBanner.className = 'mastery-container';
            contentInner.appendChild(lockBanner);
        }

        // Page content anchor - where the actual page content goes
        const pageAnchor = document.createElement('div');
        pageAnchor.id = 'page-content-anchor';
        if (!isDashboard) pageAnchor.className = 'mastery-container';
        pageAnchor.appendChild(fragment); // Insert the saved content here
        contentInner.appendChild(pageAnchor);

        // Other sections
        ['knowledge-check-section', 'next-step-section', 'page-footer-actions'].forEach(id => {
            const div = document.createElement('div');
            div.id = id;
            if (id !== 'knowledge-check-section') div.className = 'mastery-container';
            contentInner.appendChild(div);
        });

        contentDiv.appendChild(contentInner);
        contentWrapper.appendChild(contentDiv);

        // Right sidebar (TOC) for non-dashboard pages
        if (!isDashboard) {
            const rightSidebar = document.createElement('div');
            rightSidebar.id = 'right-sidebar';
            rightSidebar.innerHTML = '<div class="toc-header">On this page</div><div id="toc-container"></div>';
            contentWrapper.appendChild(rightSidebar);
        }

        mainWrapper.appendChild(contentWrapper);
        document.body.appendChild(mainWrapper);

        // Step 5: Certificate template (hidden, for PDF export)
        const certDiv = document.createElement('div');
        certDiv.innerHTML = `
    <div id="certificate-container">
        <div class="cert-watermark"></div>
        <div class="cert-content">
            <div class="cert-logo-top">
                <img src="/original-logo.png" alt="ASA Logo">
            </div>
            
            <h1 class="cert-title">Certificate of Achievement</h1>
            <div class="cert-statement">This is to certify that</div>
            
            <div class="cert-name" id="cert-dynamic-name">Student Name</div>

            <div class="cert-statement">has successfully demonstrated proficiency and has been assessed in the area of</div>
            <div class="cert-achievement">UI Automation Testing</div>
            <div class="cert-statement">and is hereby awarded this certificate for passing the assessment with excellence.</div>
            
            <div class="cert-footer">
                <div class="cert-footer-item">
                    <div class="cert-dynamic-val" id="cert-dynamic-date">25 May 2025</div>
                    <div class="cert-auth-line"></div>
                    <div class="cert-auth-label">Date of Issue</div>
                </div>
                
                <div class="cert-footer-item">
                    <div class="cert-dynamic-val" id="cert-dynamic-id">ASA-UI-2025-0001</div>
                    <div class="cert-auth-line"></div>
                    <div class="cert-auth-label">Certificate ID</div>
                </div>

                <div class="cert-footer-item">
                    <div class="cert-signature-wrap">
                        <img src="/assets/signature.png" alt="Signature" style="height: 40px; margin-bottom: -10px;" onerror="this.style.display='none'">
                        <div class="cert-auth-main" style="margin-top: 0;">Syam Prasad</div>
                    </div>
                    <div class="cert-auth-line"></div>
                    <div class="cert-auth-label">Authorized Signature</div>
                </div>
            </div>

            <div class="cert-footer-meta-bottom">
                 <div class="qr-container">
                    <img id="cert-dynamic-qr" src="" alt="Verify QR">
                    <div class="qr-hint">Verify this certificate<br>Scan QR Code or visit: verify.asauthority.com</div>
                 </div>
            </div>
        </div>
    </div>`;
        document.body.appendChild(certDiv.firstElementChild);

        // Step 6: Layout-specific listeners (Mobile Only Toggle)
        document.getElementById('hamburger').addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.toggle('show');
            } else {
                // Desktop: Optional 'Force Expand' toggle if needed
                document.getElementById('sidebar').classList.toggle('force-expand');
            }
        });

        // Voice Mode Implementation
        const voiceBtn = document.getElementById('voice-toggle');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                const isSpeaking = window.speechSynthesis.speaking;
                if (isSpeaking) {
                    window.speechSynthesis.cancel();
                    voiceBtn.innerHTML = '<i data-lucide="volume-2"></i>';
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    return;
                }

                const content = document.getElementById('page-content-anchor').innerText;
                const msg = new SpeechSynthesisUtterance(content);
                msg.rate = 0.9;
                msg.onend = () => {
                    voiceBtn.innerHTML = '<i data-lucide="volume-2"></i>';
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                };

                window.speechSynthesis.speak(msg);
                voiceBtn.innerHTML = '<i data-lucide="square"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
        }

        document.getElementById('export-report').addEventListener('click', exportMasteryReport);
        initDelayedSidebarExpansion();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function initDelayedSidebarExpansion() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        const isDashboard = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');
        if (isDashboard && window.innerWidth > 1024) {
            setTimeout(() => {
                sidebar.classList.add('force-expand');
                setTimeout(() => {
                    sidebar.classList.remove('force-expand');
                }, 3000);
            }, 1000);
        }
    }

    function initThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        const updateToggleIcon = (theme) => {
            toggle.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateToggleIcon(savedTheme);

        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleIcon(newTheme);
        });
    }

    function initTabs() {
        // Event Delegation for Tabs - Robust against dynamic Markdown rendering
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (!btn) return;

            const container = btn.closest('.tabs-container');
            const tabId = btn.getAttribute('data-tab');
            if (!container || !tabId) return;

            // Update Buttons in this container only
            container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update Panes in this container only
            container.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            const targetPane = container.querySelector(`#${tabId}`);
            if (targetPane) targetPane.classList.add('active');
        });
    }

    function initUser() {
        if (document.getElementById('user-onboarding-backdrop')) return;
        const state = MasteryStore.get();
        const token = localStorage.getItem('asa_auth_token');
        if (state.user && state.user.name && token) {
            updateUserUI(state.user.name);
            return;
        }

        const modalHtml = `
        <div id="user-onboarding-backdrop">
            <div id="user-onboarding-modal">
                <div class="modal-header"><h3><i data-lucide="shield-check"></i> Secure Authentication</h3></div>
                <div class="modal-body" id="auth-step-1">
                    <p>Welcome to the Automation Skill Authority (ASA) Portal. Please log in to securely sync your Mastery Progress and Certificates.</p>
                    <div class="input-group">
                        <label>Full Name</label>
                        <input type="text" id="user-name-input" placeholder="e.g. John Doe">
                    </div>
                    <div class="input-group" style="margin-top: 10px;">
                        <label>Email Address</label>
                        <input type="email" id="user-email-input" placeholder="john@example.com">
                    </div>
                </div>
                <div class="modal-body" id="auth-step-2" style="display: none;">
                    <p>An OTP has been sent to your email. Please enter it below.</p>
                    <div class="input-group">
                        <label>One-Time Password (OTP)</label>
                        <input type="text" id="user-otp-input" placeholder="123456">
                    </div>
                </div>
                <div class="modal-footer" id="auth-footer-1">
                    <button class="init-journey-btn-new" id="request-otp-btn" onclick="saveUserIdentity()">Send OTP &rarr;</button>
                </div>
                <div class="modal-footer" id="auth-footer-2" style="display: none;">
                    <button class="init-journey-btn-new" id="verify-otp-btn" onclick="verifyOTP()">Verify & Login</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async function saveUserIdentity() {
        const nameInput = document.getElementById('user-name-input');
        const emailInput = document.getElementById('user-email-input');
        const btn = document.getElementById('request-otp-btn');

        if (!nameInput || !emailInput) return;
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name || !email) return alert("Please enter both Name and Email.");

        // Stash name/email globally for step 2
        window._tempAuthData = { name, email };
        
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader" class="spin"></i> Sending...`;
        btn.disabled = true;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        try {
            const res = await fetch('http://localhost:3000/api/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (res.ok) {
                // Transition to OTP step
                document.getElementById('auth-step-1').style.display = 'none';
                document.getElementById('auth-footer-1').style.display = 'none';
                document.getElementById('auth-step-2').style.display = 'block';
                document.getElementById('auth-footer-2').style.display = 'block';
            } else {
                alert("Error: " + (data.error || "Failed to request OTP"));
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        } catch (err) {
            console.error("Auth API Error:", err);
            alert("Could not reach authentication server. Is the backend running?");
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }
    }

    window.verifyOTP = async function() {
        const otpInput = document.getElementById('user-otp-input');
        const btn = document.getElementById('verify-otp-btn');
        if (!otpInput) return;

        const otp = otpInput.value.trim();
        if (!otp) return alert("Please enter the OTP.");

        const { name, email } = window._tempAuthData || {};

        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader" class="spin"></i> Verifying...`;
        btn.disabled = true;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        try {
            const res = await fetch('http://localhost:3000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, otp })
            });
            const data = await res.json();
            
            if (res.ok && data.token) {
                // Save token and user details
                localStorage.setItem('asa_auth_token', data.token);
                
                const state = MasteryStore.get();
                state.user = { name: data.user.name, email: data.user.email, id: data.user.id };
                MasteryStore.save(state);

                // Close modal and init
                const backdrop = document.getElementById('user-onboarding-backdrop');
                if (backdrop) backdrop.remove();

                updateUserUI(name);
                initDashboard();
                
                // Fetch existing progress from server now that we are authenticated
                await MasteryStore.fetchFromBackend();
                
            } else {
                alert("Error: " + (data.error || "Invalid OTP"));
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        } catch (err) {
            console.error("Auth API Error:", err);
            alert("Could not reach authentication server.");
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }
    };

    function updateUserUI(name) {
        const heroTitle = document.querySelector('.hero-section h1');
        if (heroTitle) heroTitle.innerHTML = `Welcome back, ${name.split(' ')[0]}!`;
    }

    function initTOC() {
        const container = document.getElementById('toc-container');
        const content = document.getElementById('page-content-anchor');
        if (!container || !content) return;

        // Use a small timeout to ensure content is fully rendered
        setTimeout(() => {
            const headers = content.querySelectorAll('h2, h3');
            if (headers.length === 0) {
                container.innerHTML = '<div class="toc-empty">No headers found</div>';
                return;
            }

            container.innerHTML = Array.from(headers).map(h => {
                if (!h.id) h.id = h.innerText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                return `<a href="#${h.id}" class="toc-link level-${h.tagName.toLowerCase()}">${h.innerText}</a>`;
            }).join('');

            // ScrollSpy Logic
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        document.querySelectorAll('.toc-link').forEach(link => {
                            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                        });
                    }
                });
            }, { rootMargin: '-10% 0p -80% 0px' });

            headers.forEach(h => observer.observe(h));
        }, 100);
    }

    function initDashboard() {
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        if (currentFile !== 'index.html') return;

        const state = MasteryStore.get();
        const dash = document.getElementById('dashboard-analytics');
        if (!dash) return;

        // Resume Logic
        const resumeContainer = document.getElementById('resume-container');
        if (resumeContainer) {
            const resumePage = learningModules.find(p => !state.completed.includes(p.id));
            if (resumePage) {
                resumeContainer.innerHTML = `
                <a href="${getRootPrefix() + resumePage.url}" class="resume-card">
                    <div class="resume-icon"><i data-lucide="play"></i></div>
                    <div class="resume-info">
                        <span>Continue Your Mastery Journey</span>
                        <strong>Resume: ${resumePage.title}</strong>
                    </div>
                    <div class="resume-action">Resume Module  </div>
                </a>`;
            } else {
                resumeContainer.innerHTML = `<div class="resume-card complete"><div class="resume-icon"><i data-lucide="award"></i></div><div class="resume-info"><span>All Modules Mastered</span><strong>Framework Certification Complete</strong></div></div>`;
            }
        }
        
        // Render completion dots
        renderProgressDots(state);

        // x⚠ INDUSTRIAL GATEKEEPER: Secure Guided Flow & Path Links
        applyGatekeeping(state);
    }

    /**
     * Secures ALL links based on MasteryStore state.
     * Scans both explicit gate-links and implicit module links in markdown.
     */
    function applyGatekeeping(state) {
        // 1. Explicit gate-links (Dashboard, Sidebar)
        const explicitLinks = document.querySelectorAll('.gate-link, .path-card, .nav-link');
        
        // 2. Implicit module links in rendered content
        const contentLinks = document.querySelectorAll('#page-content-anchor a');

        const allLinks = [...explicitLinks, ...contentLinks];

        allLinks.forEach(link => {
            let moduleId = link.getAttribute('data-module');
            const href = link.getAttribute('href');

            // If no data-module, try to find it by href
            if (!moduleId && href) {
                const targetFile = href.split('/').pop();
                const matchedModule = learningModules.find(m => m.url.includes(targetFile));
                if (matchedModule) moduleId = matchedModule.id;
            }

            if (!moduleId) return;

            // Find if this module or its predecessor is completed
            const isUnlocked = state.completed.includes(moduleId) || 
                              isNextInSequence(moduleId, state.completed);

            if (!isUnlocked && !window.location.search.includes('review=true')) {
                link.classList.add('locked-gate');
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.4';
                link.setAttribute('title', 'Locked: Complete Prerequisite Modules First');
                
                // Add lock icon if it's a simple link and doesn't have one
                if (!link.querySelector('.lucide-lock')) {
                    link.insertAdjacentHTML('afterbegin', '<i data-lucide="lock" style="width:12px; height:12px; margin-right:4px; vertical-align:middle;"></i> ');
                }
            } else {
                link.classList.remove('locked-gate');
                link.style.pointerEvents = 'auto';
                link.style.opacity = '1';
                // Remove lock if it exists
                const lock = link.querySelector('.lucide-lock');
                if (lock) lock.remove();
            }
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    /**
     * Determines if a module is the logical 'next step' for the user
     */
    function isNextInSequence(moduleId, completed) {
        if (!learningModules.length) return true; // Safety during load
        
        const id = learningModules.findIndex(m => m.id === moduleId);
        if (id === 0) return true; // First module is always unlocked
        
        // Unlocked if previous module is completed
        const prevModule = learningModules[id - 1];
                return prevModule && completed.includes(prevModule.id);
    }

    function initDashboard() {
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        if (currentFile !== 'index.html' && currentFile !== '') return;

        const dash = document.getElementById('dashboard-analytics');
        if (!dash) return;

        const state = MasteryStore.get();
        try {
            // Reset container with grid structure
            dash.innerHTML = `<div class="dash-grid"><div class="dash-section" id="skill-section-target"></div><div class="dash-section" id="analytics-section-target"></div></div>`;

            const skillTarget = document.getElementById('skill-section-target');
            const analyticsTarget = document.getElementById('analytics-section-target');

            if (!skillTarget || !analyticsTarget) return;

            // 1. Skill Profile (Platinum Radar Chart)
            const skillEntries = Object.entries(state.skills || {});
            if (skillEntries.length > 0) {
                skillTarget.innerHTML = `
                <h3><i data-lucide="award"></i> Skill Mastery Profile</h3>
                <div class="radar-container">
                    <canvas id="skillRadarChart"></canvas>
                </div>`;
                renderRadarChart(state.skills);
            } else {
                skillTarget.innerHTML = `
                <h3><i data-lucide="award"></i> Skill Mastery Profile</h3>
                <div class="empty-dashboard-state">
                    <div class="empty-icon-wrapper"><i data-lucide="zap-off"></i></div>
                    <p>No skills mapped yet. Complete modules to build your profile.</p>
                </div>`;
            }

            // 2. Module Stats & Efficiency
            const startTime = state.startTime || Date.now();
            const timeElapsed = Date.now() - startTime;
            const days = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeElapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const overallProgress = Math.round(((state.completed || []).length / (learningModules || []).length) * 100);
            const timeStr = days > 0 ? `${days}d ${hours}h` : `${hours}h`;

            const efficiencyCard = `
            <div class="stat-card platinum-stat" style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), transparent); border-color: var(--accent);">
                <div class="stat-header"><strong>Learning Efficiency</strong><span>PLATINUM METRIC</span></div>
                <div class="stat-main">
                    <div class="stat-score-wrapper"><div class="stat-score">${timeStr}</div><div class="stat-label">Time to Mastery</div></div>
                    <div class="stat-metrics">
                        <span style="color:var(--accent); font-weight:bold;">Velocity: ${overallProgress > 0 ? (overallProgress / Math.max(0.1, days + hours / 24)).toFixed(1) : 0}% / day</span>
                    </div>
                </div>
            </div>`;

            const moduleStats = (learningModules || []).map(m => {
                const score = state.scores[m.id] || 0;
                const analytics = state.analytics[m.id] || { passCount: 0, failCount: 0, weakAreas: [] };
                const isCompleted = state.completed.includes(m.id);
                const weakAreaHtml = analytics.weakAreas.length > 0 ? `<div class="stat-weak-areas"><strong>Remediation:</strong> ${analytics.weakAreas.join(', ')}</div>` : '';

                return `
                <div class="stat-card ${isCompleted ? 'completed' : ''}">
                    <div class="stat-header"><strong>${m.title}</strong><span>${isCompleted ? 'MASTERED' : 'PENDING'}</span></div>
                    <div class="stat-main">
                        <div class="stat-score-wrapper"><div class="stat-score">${score}%</div><div class="stat-label">Highest Score</div></div>
                        <div class="stat-metrics"><span class="metric-pass">⭐ ${analytics.passCount}</span><span class="metric-fail">⭐ ${analytics.failCount}</span></div>
                    </div>
                    ${weakAreaHtml}
                </div>`;
            }).join('');

            analyticsTarget.innerHTML = `<h3><i data-lucide="bar-chart-2"></i> ${state.user.name ? state.user.name.split(' ')[0] + "'s" : "Learning"} Analytics</h3><div class="stats-grid">${efficiencyCard}${moduleStats}</div>`;

            // 3. Data Persistence & Recovery UI
            const persistenceHtml = `
            <div class="dash-section persistence-manager" style="grid-column: 1 / -1; margin-top: 30px;">
                <h3><i data-lucide="database"></i> Data Persistence & Recovery</h3>
                <div class="persistence-card">
                    <div class="persistence-info">
                        <p class="persistence-title">Secure Your Mastery History</p>
                        <p class="persistence-desc">Browser history deletion will reset your progress. Download a signed backup to restore your history anytime.</p>
                    </div>
                    <div class="persistence-actions">
                        <button onclick="handleBackup()" class="action-btn"><i data-lucide="download"></i> Backup Progress</button>
                        <label class="action-btn">
                            <i data-lucide="upload"></i> Restore Backup
                            <input type="file" style="display:none" onchange="handleRestore(event)" accept=".json">
                        </label>
                        <button onclick="handleMobileSync()" class="action-btn sync-mobile-btn"><i data-lucide="smartphone"></i> Sync to Mobile</button>
                    </div>
                </div>
            </div>`;
            dash.querySelector('.dash-grid').insertAdjacentHTML('beforeend', persistenceHtml);

            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) {
            console.error("Dashboard render crash:", err);
            dash.innerHTML = `<div class="dash-error"><i data-lucide="alert-triangle"></i> Error rendering insights. Please refresh.</div>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    function renderRadarChart(skills) {
        const ct = document.getElementById('skillRadarChart');
        if (!ct || typeof Chart === 'undefined') return;

        const labels = Object.keys(skills).map(k => k.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        const data = Object.values(skills);

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Skill Level',
                    data: data,
                    fill: true,
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    borderColor: '#38bdf8',
                    pointBackgroundColor: '#38bdf8',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#38bdf8'
                }]
            },
            options: {
                elements: { line: { borderWidth: 3 } },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(203, 213, 225, 0.2)' },
                        grid: { color: 'rgba(203, 213, 225, 0.2)' },
                        pointLabels: { color: '#94a3b8', font: { size: 11 } },
                        ticks: { display: false, stepSize: 20 },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    function checkGlobalAccess() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('index.html') || currentPath.endsWith('/')) return false;

        const state = MasteryStore.get();
        const modules = learningModules;

        // Find the current page module - Correct matching for deep subfolders and extensionless URLs
        const currentIndex = modules.findIndex(m => {
            const normalizedPath = currentPath.replace('.html', '');
            const normalizedUrl = m.url.replace('.html', '');
            return normalizedPath.endsWith(normalizedUrl);
        });
        if (currentIndex === -1) return false;

        // Check if any previous module is incomplete
        let firstIncompleteIndex = modules.findIndex(m => !state.completed.includes(m.id));

        // If the user is trying to access a module BEYOND the first incomplete one
        if (firstIncompleteIndex !== -1 && currentIndex > firstIncompleteIndex) {
            if (window.location.search.includes('review=true')) return false;
            
            showGlobalLockOverlay(modules[firstIncompleteIndex]);
            return true; // Access Blocked
        }
        return false;
    }

    function showGlobalLockOverlay(requiredModule) {
        // Prevent multiple overlays
        if (document.getElementById('global-lock-overlay')) return;

        const linkHtml = `<a href="${getRootPrefix() + requiredModule.url}" class="unlock-path-btn">Master ${requiredModule.title}  </a>`;

        const overlay = document.createElement('div');
        overlay.id = 'global-lock-overlay';
        overlay.innerHTML = `
        <div class="lock-backdrop"></div>
        <div class="lock-message-card">
            <div class="lock-shield"><i data-lucide="shield-alert"></i></div>
            <h2>Access Restricted</h2>
            <p>This module is currently locked in your Mastery Journey.</p>
            <div class="required-step">
                <span class="step-label">PREREQUISITE REQUIRED:</span>
                <span class="step-name">${requiredModule.title}</span>
            </div>
            <p class="lock-hint">You must master the prerequisite module before advancing to this technical level.</p>
            <div class="lock-footer">
                ${linkHtml}
                <a href="${getRootPrefix()}index.html" class="back-home-link">Return to Dashboard</a>
            </div>
        </div>
    `;
        document.body.appendChild(overlay);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function renderRadarChart(skills) {
        // Wait for DOM to be ready for the canvas
        setTimeout(() => {
            const canvas = document.getElementById('skillRadarChart');
            if (!canvas) return;

            if (typeof Chart === 'undefined') {
                console.warn("Chart.js not yet loaded. Retrying in 500ms...");
                setTimeout(() => renderRadarChart(skills), 500);
                return;
            }

            const ct = canvas.getContext('2d');
            const labels = Object.keys(skills).map(k => k.replace(/_/g, ' ').toUpperCase());
            const data = Object.values(skills);

            if (window.myRadarChart) window.myRadarChart.destroy();

            window.myRadarChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Mastery Level',
                        data: data,
                        backgroundColor: 'rgba(56, 189, 248, 0.2)',
                        borderColor: '#38bdf8',
                        borderWidth: 2,
                        pointBackgroundColor: '#38bdf8',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#38bdf8'
                    }]
                },
                options: {
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
                            grid: { color: 'rgba(148, 163, 184, 0.2)' },
                            pointLabels: {
                                color: '#94a3b8',
                                font: { size: 10, weight: 'bold' }
                            },
                            suggestedMin: 0,
                            suggestedMax: 100,
                            ticks: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `Mastery: ${context.raw}%`
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }, 50);
    }

    function renderNav() {
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        const navContainer = document.getElementById('nav-container');
        if (!navContainer) return;

        const state = MasteryStore.get();
        const fragment = document.createDocumentFragment();

        let lastWasCompleted = true;

        const grouped = learningModules.reduce((acc, p) => {
            (acc[p.group] = acc[p.group] || []).push(p);
            return acc;
        }, {});

        Object.keys(grouped).forEach(groupName => {
            const groupHeader = document.createElement('div');
            groupHeader.className = 'nav-group-header';
            const groupColor = groupName.includes('Beginner') ? '#10b981' : (groupName.includes('Intermediate') ? '#f59e0b' : '#ef4444');
            groupHeader.innerHTML = `
                <span class="nav-status-dot" style="background: ${groupColor}"></span>
                <span class="nav-group-title">${groupName}</span>
            `;
            fragment.appendChild(groupHeader);

            grouped[groupName].forEach(p => {
                const isActive = currentFile === p.url.split('/').pop();
                const isCompleted = state.completed.includes(p.id);
                const isLocked = !lastWasCompleted;

                const link = document.createElement(isLocked ? 'div' : 'a');
                link.className = `nav-link ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
                if (!isLocked) link.href = getRootPrefix() + p.url;
                link.setAttribute('data-tooltip', isLocked ? "Complete Previous Modules to Unlock" : p.title);

                const iconName = isLocked ? 'lock' : (isCompleted ? 'check-circle' : (p.icon || 'circle'));
                link.innerHTML = `
                    <i data-lucide="${iconName}" class="nav-icon"></i>
                    <span class="nav-link-text">${p.title}</span>
                `;

                fragment.appendChild(link);
                lastWasCompleted = isCompleted;
            });
        });

        navContainer.innerHTML = '';
        navContainer.appendChild(fragment);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function renderNextStep(currentPage) {
        const currentIndex = learningModules.findIndex(p => p.id === currentPage.id);
        const nextPage = learningModules[currentIndex + 1];
        if (!nextPage) return;

        const nextSection = document.getElementById('next-step-section');
        if (!nextSection) return;

        nextSection.innerHTML = `
            <div class="next-step-card">
                <div class="next-label">Recommended Next Step</div>
                <h3>${nextPage.title}</h3>
                <p>Continue your journey in the ${nextPage.group} path.</p>
                <a href="${getRootPrefix() + nextPage.url}" class="next-btn">Continue Mastery  </a>
            </div>`;
    }

    async function exportMasteryReport() {
        const state = MasteryStore.get();
        const overallScore = MasteryStore.calculateOverallMastery();

        const isReviewMode = window.location.search.includes('review=true');
        if (overallScore < 100 && !isReviewMode) {
            showLockModal(overallScore, learningModules.length - state.completed.length);
            return;
        }

        const userName = state.user.name || "Engineering Candidate";
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const container = document.getElementById('certificate-container');
        if (!container) {
            console.error("Certificate template missing!");
            return;
        }

        const btn = document.getElementById('export-report');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader" class="spin"></i> Verifying with Authority...`;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // 1. Fetch Secure Certificate from Backend API
        let certData;
        try {
            const token = localStorage.getItem('asa_auth_token');
            const response = await fetch('http://localhost:3000/api/certify', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ name: userName }) // Sending name for fallback until Auth UI is wired
            });
            
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to certify");
            }
            certData = await response.json();
        } catch (err) {
            console.error("Backend Certification Error:", err);
            alert("Security Gate Blocked: " + err.message + "\n\nMake sure your backend is running.");
            btn.innerHTML = originalHtml;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        const certId = certData.certId;
        const fullSig = certData.signature;
        const authSig = "VERIFIED-SECURE-" + fullSig.substring(0, 12).toUpperCase();
        const timestamp = Date.now();

        // Build the dynamic QR URL pointing to our local verification portal
        const verifyPath = window.location.href.split('/').slice(0, -1).join('/') + '/verify.html';
        const qrPayload = `${verifyPath}?id=${certId}&sig=${fullSig}&ts=${timestamp}&score=${overallScore}%`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;

        document.getElementById('cert-dynamic-name').textContent = certData.name.toUpperCase();
        document.getElementById('cert-dynamic-score').textContent = overallScore + "%";
        document.getElementById('cert-dynamic-date').textContent = dateStr;
        document.getElementById('cert-dynamic-id').textContent = certId;
        document.getElementById('cert-dynamic-sig').textContent = authSig;
        
        // x⚠ CRITICAL: Wait for QR image to actually LOAD before PDF generation
        // This solves the "missing QR" issue in generated PDFs
        const qrImgElement = document.getElementById('cert-dynamic-qr');
        const qrLoadPromise = new Promise((resolve) => {
            qrImgElement.onload = resolve;
            qrImgElement.onerror = () => {
                console.error("QR Generation Service unreachable. Using fallback.");
                resolve();
            };
        });
        qrImgElement.src = qrUrl;
        await qrLoadPromise;

        // x⚠ ZERO-LOS✓ MIGRATION STRATEGY
        const exportContext = document.createElement('div');
        exportContext.id = 'export-context-wrapper';

        // Save original parent to restore later
        const originalParent = container.parentNode;
        const originalNextSibling = container.nextSibling;

        // Apply clean, isolated styles to the context wrapper
        Object.assign(exportContext.style, {
            position: 'fixed',
            top: '0',
            left: '-10000px', // Further out
            width: '1056px',
            height: '816px',
            zIndex: '9999',
            display: 'block',
            background: '#0f172a'
        });

        // MOVE the actual container into the export context
        exportContext.appendChild(container);
        document.body.appendChild(exportContext);

        // Force visibility for the engine
        container.style.display = 'block';
        container.style.opacity = '1';
        container.style.position = 'relative';
        container.style.left = '0';
        container.style.top = '0';

        // Force contrast and resolve transparent text issues
        const style = document.createElement('style');
        style.id = 'export-overrides';
        style.innerHTML = `
        #certificate-container { 
            opacity: 1 !important; 
            display: block !important; 
            visibility: visible !important; 
            padding: 30px 50px !important;
            background: #0f172a !important;
            color: #cbd5e1 !important;
            position: relative !important;
        }
        #certificate-container .cert-content { 
            background: transparent !important; 
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
        }
            overflow: hidden !important;
        }
        #certificate-container .cert-watermark {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    
    width: 120%;
    height: 120%;
    
    background-image: url('${getRootPrefix()}original-logo.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    
    opacity: 0.045; /* Sweet spot */
    
    filter: blur(0.5px); /* very subtle */
    
    z-index: 0;
    pointer-events: none;
}
        #certificate-container .cert-content { 
            background: transparent !important; 
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
            position: relative !important;
            z-index: 1 !important;
            /* PRO UPGRADE: Subtle glow behind name */
            background: radial-gradient(circle at center, rgba(56, 189, 248, 0.05) 0%, transparent 60%) !important;
        }
        #certificate-container .brand-logo { 
            height: 70px !important; 
            width: auto !important; 
            object-fit: contain !important; 
            margin-bottom: 10px !important;
        }
        #certificate-container .cert-title { 
            font-size: 2.2rem !important;
            margin-bottom: 5px !important;
            background: none !important;
            color: #38bdf8 !important;
            -webkit-text-fill-color: #38bdf8 !important;
            text-shadow: 0 0 10px rgba(56, 189, 248, 0.3) !important;
            text-transform: uppercase !important;
            font-weight: 800 !important;
        }
        #certificate-container .cert-statement { margin: 10px 0 !important; font-size: 1rem !important; color: #cbd5e1 !important; }
        #certificate-container .cert-name { 
            font-size: 2.8rem !important;
            margin: 5px 0 !important;
            font-family: 'Dancing Script', cursive !important;
            color: #38bdf8 !important;
        }
        #certificate-container .cert-program-info { 
            display: flex !important;
            justify-content: space-around !important;
            width: 100% !important;
            margin: 10px 0 !important; 
            padding: 12px !important;
            border-top: 1px solid rgba(56, 189, 248, 0.2) !important;
            border-bottom: 1px solid rgba(56, 189, 248, 0.2) !important;
        }
        #certificate-container .cert-program-info .info-item { flex: 1 !important; text-align: center !important; }
        #certificate-container .cert-metrics { margin: 10px 0 !important; display: flex !important; gap: 40px !important; }
        #certificate-container .cert-footer { 
            margin-top: 0 !important; 
            width: 100% !important; 
            display: flex !important; 
            justify-content: space-between !important; 
            align-items: flex-end !important; /* Align both blocks to baseline */
        }
        #certificate-container .cert-auth-main { font-size: 1.8rem !important; font-family: 'Dancing Script', cursive !important; color: #38bdf8 !important; margin-bottom: 4px !important; }
        #certificate-container .cert-auth-org { margin-top: 6px !important; color: #94a3b8 !important; }
        #certificate-container .cert-verification-block { 
            margin-top: 10px !important; 
            border-top: 1px solid rgba(56, 189, 248, 0.2) !important;
            padding-top: 10px !important;
            width: 100% !important;
            text-align: center !important;
        }
        #certificate-container .cert-footer-meta {
            width: 100% !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-top: 15px !important;
            padding-top: 10px !important;
            border-top: 1px solid rgba(56, 189, 248, 0.2) !important;
        }
        #certificate-container .cert-id-wrap { 
            font-weight: 900 !important; 
            font-size: 1.1rem !important; 
            letter-spacing: 2px !important;
            color: #38bdf8 !important;
            font-family: monospace !important;
            margin-bottom: 2px !important;
        }
        #certificate-container .cert-sig-wrap {
            font-size: 0.7rem !important;
            color: #64748b !important;
            font-family: monospace !important;
            letter-spacing: 1px !important;
        }
        #certificate-container .cert-qr-wrap {
            text-align: center !important;
        }
        #certificate-container #cert-dynamic-qr {
            width: 80px !important;
            height: 80px !important;
            border: 4px solid white !important;
            border-radius: 4px !important;
        }
        #certificate-container .qr-hint {
            font-size: 0.6rem !important;
            color: #94a3b8 !important;
            margin-top: 4px !important;
            text-transform: uppercase !important;
        }
    `;
        document.head.appendChild(style);

        const opt = {
            margin: 0,
            filename: `ASA_Certification_${userName.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: '#0f172a',
                width: 1056,
                height: 816
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
        };

        // Step into PDF generation
        btn.innerHTML = `<i data-lucide="loader" class="spin"></i> Generating Assets...`;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
            try {
                if (typeof html2pdf === 'undefined') throw new Error("PDF Engine missing");

                // x⚠ PRE-LOAD IMAGE✓ TO PREVENT RENDER FAILURE
                const images = container.querySelectorAll('img');
                const imagePromises = Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                });

                Promise.all(imagePromises).then(() => {
                    html2pdf().set(opt).from(container).save().then(() => {
                        // RESTORE DOM
                        if (document.getElementById('export-overrides')) document.head.removeChild(style);
                        container.style.display = 'none';
                        container.style.opacity = '0';
                        originalParent.insertBefore(container, originalNextSibling);
                        if (document.getElementById('export-context-wrapper')) document.body.removeChild(exportContext);
                        btn.innerHTML = originalHtml;
                        if (typeof lucide !== 'undefined') lucide.createIcons();
                    }).catch(err => {
                        console.error("PDF Export failed:", err);
                        alert("Export failed at save step. Check console.");
                        cleanup();
                    });
                });

                function cleanup() {
                    if (document.getElementById('export-overrides')) document.head.removeChild(style);
                    originalParent.insertBefore(container, originalNextSibling);
                    if (document.getElementById('export-context-wrapper')) document.body.removeChild(exportContext);
                    btn.innerHTML = originalHtml;
                }
            } catch (err) {
                console.error("PDF Engine Error:", err);
                originalParent.insertBefore(container, originalNextSibling);
                if (document.getElementById('export-context-wrapper')) document.body.removeChild(exportContext);
                btn.innerHTML = originalHtml;
                alert(err.message);
            }
        }, 1200); // Slightly more delay for high-res images
    }

    function showLockModal(score, remaining) {
        const modal = document.createElement('div');
        modal.className = 'lock-modal-overlay';
        modal.innerHTML = `
        <div class="lock-modal">
            <div class="lock-icon">
                <i data-lucide="graduation-cap"></i>
            </div>
            <h2>Certification Locked</h2>
            <p class="lock-score">You are currently at <strong>${score}%</strong> completion.</p>
            <div class="lock-progress-container">
                <div class="lock-progress-bar" style="width: ${score}%"></div>
            </div>
            <p class="lock-remaining">Complete the remaining <strong>${remaining}</strong> modules to unlock your official ASA Certification.</p>
            <div class="lock-motivation">
                <i data-lucide="sparkles"></i>
                <span>You're just ${remaining} modules away from certification!</span>
            </div>
            <div class="lock-actions">
                <button class="lock-btn-primary" onclick="this.closest('.lock-modal-overlay').remove()">Resume Learning</button>
                <button class="lock-btn-secondary" onclick="this.closest('.lock-modal-overlay').remove()">View Modules</button>
            </div>
        </div>
    `;
        document.body.appendChild(modal);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function initCommandPalette() {
        const modalHtml = `<div id="search-modal-backdrop"><div id="search-modal"><div class="modal-search-input-wrapper"><i data-lucide="search"></i><input type="text" id="modal-search-input" placeholder="Search documentation..." autocomplete="off"></div><div class="modal-search-results" id="modal-search-results"></div><div class="modal-footer"><span><span class="key-hint">  </span> to navigate</span><span><span class="key-hint"> </span> to select</span><span><span class="key-hint">esc</span> to close</span></div></div></div>`;
        if (!document.getElementById('search-modal-backdrop')) document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        const backdrop = document.getElementById('search-modal-backdrop');
        const input = document.getElementById('modal-search-input');
        const resultsContainer = document.getElementById('modal-search-results');
        let selectedInde = -1; let filteredPages = [];

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); backdrop.style.display = 'flex'; input.focus(); }
            if (e.key === 'Escape') backdrop.style.display = 'none';
        });

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase(); selectedInde = -1;
            if (query.length < 2) { resultsContainer.innerHTML = ''; filteredPages = []; return; }

            // DEEP SEARCH ALGORITHM
            filteredPages = (searchIndex.length > 0 ? searchIndex : learningModules).map(p => {
                let weight = 0;
                let matchType = '';

                if (p.title.toLowerCase().includes(query)) { weight += 100; matchType = 'Title'; }
                else if (p.headings && p.headings.some(h => h.toLowerCase().includes(query))) { weight += 80; matchType = 'Section'; }
                else if (p.keywords && p.keywords.toLowerCase().includes(query)) { weight += 60; matchType = 'Outcome'; }
                else if (p.content && p.content.toLowerCase().includes(query)) { weight += 40; matchType = 'Content'; }

                return { ...p, weight, matchType };
            }).filter(p => p.weight > 0).sort((a, b) => b.weight - a.weight).slice(0, 8);

            renderResults();
        });

        function renderResults() {
            resultsContainer.innerHTML = filteredPages.map((p, i) => `
            <a href="${p.url}" class="modal-search-item ${i === selectedInde ? 'selected' : ''}">
                <div class="search-item-icon-wrapper">
                    <i data-lucide="file-text"></i>
                    <span class="match-type-tag">${p.matchType}</span>
                </div>
                <div class="modal-search-item-info">
                    <span class="modal-search-item-title">${p.title}</span>
                    <span class="modal-search-item-group">${p.group}</span>
                </div>
            </a>`).join('');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    function initBreadcrumbs() {
        const container = document.getElementById('breadcrumbs');
        if (!container) return;

        const path = window.location.pathname;
        const isModule = path.includes('/modules/');
        const currentModule = learningModules.find(m => {
            const normalizedPath = path.replace('.html', '');
            const normalizedUrl = m.url.replace('.html', '');
            return normalizedPath.endsWith(normalizedUrl);
        });
        const currentFile = path.split('/').pop();

        let html = `<a href="${getRootPrefix()}index.html">Dashboard</a>`;
        if (isModule && currentModule) {
            const groupShort = currentModule.group.split(':').pop().trim();
            html += ` <i data-lucide="chevron-right"></i> <span>${groupShort}</span>`;
            html += ` <i data-lucide="chevron-right"></i> <span class="active">${currentModule.title}</span>`;
        }

        container.innerHTML = `<div class="breadcrumb-nav">${html}</div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function initSearch() {
        const input = document.getElementById('search-input');
        const resultsRaw = document.getElementById('search-results');
        if (!input) return;

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) { resultsRaw.style.display = 'none'; return; }

            const mapped = (searchIndex.length > 0 ? searchIndex : learningModules).filter(p =>
                p.title.toLowerCase().includes(query) ||
                (p.keywords && p.keywords.toLowerCase().includes(query)) ||
                p.group.toLowerCase().includes(query)
            );
            resultsRaw.innerHTML = mapped.map(p => `<a href="${getRootPrefix() + p.url}" class="search-item"><strong>${p.title}</strong><br><small>${p.group}</small></a>`).join('');
            resultsRaw.style.display = 'block';
        });
    }

    function initASTPlayground() {
        const btn = document.getElementById('ast-analyze-btn');
        const input = document.getElementById('ast-playground-input');
        const results = document.getElementById('ast-playground-results');
        if (!btn || !input || !results) return;

        btn.onclick = () => {
            const code = input.value.trim();
            if (!code) {
                results.innerHTML = '<div class="placeholder-text">Please enter some code to analyze.</div>';
                return;
            }

            const ast = CodeValidator.parse(code);
            if (ast.error) {
                results.innerHTML = `<div class="audit-result-card error"><div class="audit-badge">SYNTAX ERROR</div><div class="audit-feedback">${ast.error}</div></div>`;
                return;
            }

            let hasActions = false;
            let hasAssertions = false;
            let hasStrictAssertions = false;
            let hasSleep = false;

            CodeValidator.traverse(ast, (node) => {
                if (node.type === 'CallExpression') {
                    const name = node.callee.name || (node.callee.property && node.callee.property.name);
                    if (['click', 'type', 'fill', 'selectOption', 'hover'].includes(name)) hasActions = true;
                    if (['expect', 'toBeVisible', 'toHaveText', 'toHaveValue'].includes(name)) hasAssertions = true;
                    if (['toEqual', 'toBe', 'toContain', 'toMatch'].includes(name)) hasStrictAssertions = true;
                    if (['sleep', 'waitForTimeout'].includes(name)) hasSleep = true;
                }
            });

            let status = 'SKELETON';
            let feedback = '';
            let badgeClass = 'skeleton';

            if (hasSleep) {
                status = 'VIOLATION';
                feedback = 'Architectural Failure: Hardcoded sleeps detected. Tests will be unstable in CI/CD.';
                badgeClass = 'error';
            } else if (hasActions && (hasAssertions || hasStrictAssertions)) {
                status = 'HEALTHY';
                feedback = 'Industrial Grade: Interactions and assertions are balanced correctly.';
                badgeClass = 'healthy';
            } else if (hasActions && !hasAssertions) {
                status = 'WEAK';
                feedback = 'Warning: Test has interactions but no functional assertions. Silent failure risk.';
                badgeClass = 'weak';
            } else {
                status = 'SKELETON';
                feedback = 'Error: Test is missing interactions or assertions. It provides zero coverage.';
                badgeClass = 'skeleton';
            }

            results.innerHTML = `
                <div class="audit-result-card ${badgeClass}">
                    <div class="audit-badge">${status}</div>
                    <div class="audit-feedback">${feedback}</div>
                </div>
                <div class="audit-details" style="font-size:0.75rem; color:var(--text-muted); padding: 0 10px;">
                    Heuristics: Actions (${hasActions ? '✓' : '✗'}), Assertions (${hasAssertions || hasStrictAssertions ? '✓' : '✗'}), Strictness (${hasStrictAssertions ? 'High' : 'Low'})
                </div>
            `;
        };
    }

    function injectDependencies() {
        const prefix = getRootPrefix();
        const deps = [
            { src: prefix + 'assets/libs/html2pdf-0.10.1.bundle.min.js' },
            { src: prefix + 'assets/libs/chart-4.4.2.min.js' },
            { src: prefix + 'assets/libs/mermaid-10.9.1.min.js' }
        ];

        deps.forEach(dep => {
            const exists = Array.from(document.scripts).some(s => s.src.includes(dep.src));
            if (!exists) {
                const script = document.createElement('script');
                script.src = dep.src;
                script.async = false;
                document.head.appendChild(script);
            }
        });
    }

    // Auto-bootstrap portal if not already initialized (Legacy Support)
    document.addEventListener('DOMContentLoaded', () => {
        // We only auto-init if the page didn't explicitly call it
        setTimeout(() => {
            const hasStarted = !!document.getElementById('sidebar');
            if (typeof window.initPortal === 'function' && !hasStarted) {
                console.log("x Auto-bootstrapping portal...");
                window.initPortal();
            }
        }, 200);
    });

    // Export necessary globals
    window.initPortal = initPortal;
    window.handleOptionSelect = handleOptionSelect;
    window.handleCodeInput = handleCodeInput;
    window.handleFinalSubmit = handleFinalSubmit;
    window.handleRetry = handleRetry;
    window.showTaskValidator = showTaskValidator;
    window.validateTaskProof = validateTaskProof;
    window.closeValidator = closeValidator;
    window.saveUserIdentity = saveUserIdentity;
    window.handleMobileSync = () => {
        const state = MasteryStore.get();
        const encoded = btoa(JSON.stringify(state));
        // Use the current URL minus existing hash
        const baseUrl = window.location.href.split('#')[0];
        const syncUrl = `${baseUrl}#sync=${encoded}`;

        // We use QR Server for free, reliable generation
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(syncUrl)}`;

        const modalHtml = `
        <div id="qr-sync-modal-backdrop" style="display:flex">
            <div id="qr-sync-modal">
                <h3><i data-lucide="smartphone"></i> Sync to Mobile</h3>
                <p class="sync-instructions">Scan this QR code with your mobile camera to instantly transfer your mastery progress and certificates.</p>
                <div class="qr-wrapper">
                    <img src="${qrUrl}" alt="Sync QR Code">
                </div>
                <button class="sync-done-btn" onclick="document.getElementById('qr-sync-modal-backdrop').remove()">Close Sync Portal</button>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };
    window.handleResetModule = (moduleId) => {
        if (confirm("Administrative Reset will clear all attempts and scores for this module. Proceed?")) {
            AttemptManager.reset(moduleId);
            location.reload();
        }
    };
    window.handleBackup = () => MasteryStore.downloadBackup();
    window.handleRestore = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try {
            await MasteryStore.restoreBackup(file);
            alert("Success: Industrial Mastery Progress Restored.");
            location.reload();
        } catch (err) {
            alert("Restoration Failed: " + err);
        }
    };

})();
