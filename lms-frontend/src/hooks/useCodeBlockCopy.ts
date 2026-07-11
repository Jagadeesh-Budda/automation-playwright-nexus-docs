import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useCodeBlockCopy() {
  const pathname = usePathname();

  useEffect(() => {
    const setupCopyButtons = () => {
      const preBlocks = document.querySelectorAll('pre');
      preBlocks.forEach((pre) => {
        // Prevent duplicate buttons
        if (pre.querySelector('.copy-code-btn')) return;

        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.type = 'button';
        
        const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
        const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide-check-icon"><path d="M20 6 9 17l-5-5"/></svg>`;

        button.innerHTML = `${copyIcon} Copy`;
        
        button.addEventListener('click', async () => {
          // Select actual code content (strip out the button text)
          const codeElem = pre.querySelector('code');
          let codeText = '';
          
          if (codeElem) {
            // Get text, avoiding copying the button text itself
            const clone = codeElem.cloneNode(true) as HTMLElement;
            const btnInClone = clone.querySelector('.copy-code-btn');
            if (btnInClone) btnInClone.remove();
            codeText = clone.innerText;
          } else {
            codeText = pre.innerText;
            // Strip out our buttons or copy text if it falls back
            const btnText = button.innerText;
            codeText = codeText.replace(btnText, '');
          }

          try {
            await navigator.clipboard.writeText(codeText.trim());
            button.innerHTML = `${checkIcon} Copied!`;
            button.classList.add('copied');
            setTimeout(() => {
              button.innerHTML = `${copyIcon} Copy`;
              button.classList.remove('copied');
            }, 2000);
          } catch (err) {
            console.error('Failed to copy code:', err);
          }
        });

        // Ensure relative styling
        if (getComputedStyle(pre).position === 'static') {
          pre.style.position = 'relative';
        }
        pre.appendChild(button);
      });
    };

    // Run slightly delayed to ensure MDX content has fully mounted
    const timer = setTimeout(setupCopyButtons, 300);
    return () => clearTimeout(timer);
  }, [pathname]);
}
