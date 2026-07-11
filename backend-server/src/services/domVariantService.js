class DomVariantService {
    /**
     * Retrieves all controlled DOM variations and their grading contracts for a specific practical question.
     * @param {string} questionId 
     */
    getQuestionVariants(questionId) {
        const registry = {
            'q-locators-code': [
                {
                    variantId: 'v1',
                    html: `<div class="form-group"><button id="btn-submit">Submit Order</button></div>`,
                    contract: {
                        targetSelectorHint: 'role=button[name=/submit order/i]',
                        allowedLocatorTypes: ['role'],
                        successSignal: { type: 'visibility', selector: '#btn-submit' }
                    }
                },
                {
                    variantId: 'v2',
                    html: `<main class="checkout"><button data-testid="checkout-submit">Submit</button></main>`,
                    contract: {
                        targetSelectorHint: 'role=button[name=/submit/i]',
                        allowedLocatorTypes: ['role', 'testId'],
                        successSignal: { type: 'visibility', selector: '[data-testid="checkout-submit"]' }
                    }
                },
                {
                    variantId: 'v3',
                    html: `<section><div role="button" tabindex="0" class="btn-primary action-submit">Submit</div></section>`,
                    contract: {
                        targetSelectorHint: 'role=button[name=/submit/i]',
                        allowedLocatorTypes: ['role'],
                        successSignal: { type: 'visibility', selector: '.action-submit' }
                    }
                }
            ],
            'q-async-code': [
                {
                    variantId: 'v1',
                    html: `<button id="load-data">Load</button><div id="result" style="display:none">Data Loaded</div>`,
                    contract: {
                        targetSelectorHint: 'role=button[name=/load/i]',
                        allowedLocatorTypes: ['role'],
                        successSignal: { type: 'visibility', selector: '#result' }
                    }
                }
            ],
            'q-multi-step-flow': [
                {
                    variantId: 'v1',
                    html: `<div><input id="user" placeholder="User"><button id="login">Login</button><div id="welcome" style="display:none">Welcome</div></div>`,
                    contract: {
                        targetSelectorHint: 'Sequence: fill user -> click login -> verify welcome',
                        allowedLocatorTypes: ['role', 'placeholder'],
                        requiredSequence: ['fill', 'click'],
                        successSignal: { type: 'visibility', selector: '#welcome' }
                    }
                }
            ]
        };

        return registry[questionId] || [];
    }

    /**
     * Picks a random variant for a user session to prevent cheating.
     * @param {string} questionId 
     */
    getRandomVariant(questionId) {
        const variants = this.getQuestionVariants(questionId);
        if (!variants.length) return null;
        return variants[Math.floor(Math.random() * variants.length)];
    }
}

module.exports = new DomVariantService();
