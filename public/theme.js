// Global Theme Management - Dark Mode Only
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.initializeTheme();
    }

    initializeTheme() {
        // Always set dark theme
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }

    getCurrentTheme() {
        return 'dark';
    }

    setTheme(theme) {
        // Always force dark theme
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}