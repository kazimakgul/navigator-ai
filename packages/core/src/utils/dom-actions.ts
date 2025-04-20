export class DomActions {
    private debugMode = false;

    constructor(options?: { debug?: boolean }) {
        this.debugMode = options?.debug ?? false;
    }

    public setDebugMode(enable: boolean): void {
        this.debugMode = enable;
    }

    public async simulateHumanClick(element: Element): Promise<void> {
        const rect = element.getBoundingClientRect();
        const centerX = Math.floor(rect.left + rect.width / 2);
        const centerY = Math.floor(rect.top + rect.height / 2);

        element.dispatchEvent(new MouseEvent('mouseover', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: centerX,
            clientY: centerY
        }));

        element.dispatchEvent(new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: centerX,
            clientY: centerY
        }));

        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

        element.dispatchEvent(new MouseEvent('mouseup', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: centerX,
            clientY: centerY
        }));

        element.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: centerX,
            clientY: centerY
        }));

        await new Promise(resolve => setTimeout(resolve, 300));
    }

    public async simulateHumanInput(element: HTMLInputElement, text: string, shouldPressEnter = true): Promise<void> {
        element.focus();
        element.value = '';

        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);

            element.value += char;

            element.dispatchEvent(new Event('input', { bubbles: true }));

            const keyCode = char.charCodeAt(0);

            element.dispatchEvent(new KeyboardEvent('keydown', {
                key: char,
                code: `Key${char.toUpperCase()}`,
                keyCode: keyCode,
                which: keyCode,
                bubbles: true,
                cancelable: true
            }));

            element.dispatchEvent(new KeyboardEvent('keypress', {
                key: char,
                code: `Key${char.toUpperCase()}`,
                keyCode: keyCode,
                which: keyCode,
                bubbles: true,
                cancelable: true
            }));

            element.dispatchEvent(new KeyboardEvent('keyup', {
                key: char,
                code: `Key${char.toUpperCase()}`,
                keyCode: keyCode,
                which: keyCode,
                bubbles: true,
                cancelable: true
            }));

            const typingDelay = Math.floor(Math.random() * 70) + 30;
            await new Promise(resolve => setTimeout(resolve, typingDelay));

            if (Math.random() < 0.125 && i < text.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
            }
        }

        element.dispatchEvent(new Event('change', { bubbles: true }));

        if (shouldPressEnter) {
            await this.simulateEnterKey(element);
        }

        await new Promise(resolve => setTimeout(resolve, 300));
    }

    public async simulateEnterKey(element: Element): Promise<void> {
        element.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        }));

        element.dispatchEvent(new KeyboardEvent('keypress', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        }));

        let formToSubmit: HTMLFormElement | null = null;
        if (element instanceof HTMLInputElement && element.form) {
            formToSubmit = element.form;
        } else if (element.closest('form')) {
            formToSubmit = element.closest('form') as HTMLFormElement;
        }

        if (formToSubmit) {
            formToSubmit.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

            const submitButton = formToSubmit.querySelector('input[type="submit"], button[type="submit"]');
            if (submitButton) {
                submitButton.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
            }
        }

        element.dispatchEvent(new KeyboardEvent('keyup', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        }));

        await new Promise(resolve => setTimeout(resolve, 200));
    }

    public async copyElementToClipboard(element: Element): Promise<void> {
        try {
            // copy element html to clipboard
            const html = element.outerHTML;
            await navigator.clipboard.writeText(html);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    }

    public async switchToTab(tabId: number): Promise<void> {
        try {
            // Send a message to the background script to switch tabs
            // @ts-ignore
            chrome.runtime.sendMessage({
                type: 'switchTab',
                tabId: tabId
            }, (response) => {
                if (response && response.success) {
                    console.log(`Successfully switched to tab ${tabId}`);
                } else {
                    console.error('Failed to switch tab:', response?.error || 'Unknown error');
                }
            });
        } catch (error) {
            console.error('Failed to switch to tab:', error);
        }
    }
}