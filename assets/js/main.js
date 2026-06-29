// Global JavaScript for Metabarcoding Workshop Documentation

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Copy to Clipboard functionality for code blocks
    initCodeCopyButtons();
});

function initCodeCopyButtons() {
    // Find all pre elements
    const codeBlocks = document.querySelectorAll('pre');

    codeBlocks.forEach((block) => {
        // Wrap the pre element in a relative container if it isn't already
        if (!block.parentElement.classList.contains('code-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'code-container';
            block.parentNode.insertBefore(wrapper, block);
            wrapper.appendChild(block);
        }

        // Create the copy button
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.innerHTML = '<i class="ph ph-copy"></i> Copy';
        
        // Add button to the container
        block.parentElement.appendChild(button);

        // Add click event listener
        button.addEventListener('click', async () => {
            const code = block.querySelector('code') ? block.querySelector('code').innerText : block.innerText;
            
            try {
                await navigator.clipboard.writeText(code);
                // Visual feedback
                button.innerHTML = '<i class="ph ph-check"></i> Copied!';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.innerHTML = '<i class="ph ph-copy"></i> Copy';
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                button.innerHTML = '<i class="ph ph-x"></i> Failed';
                setTimeout(() => {
                    button.innerHTML = '<i class="ph ph-copy"></i> Copy';
                }, 2000);
            }
        });
    });
}
