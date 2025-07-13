# Tailwind CSS v4 + Vite 7 Best Practices Guide

## Overview

This guide covers best practices for using Tailwind CSS v4 with Vite 7, based on the latest documentation and current project setup. Tailwind CSS v4 introduces significant changes from v3, including a new architecture and improved integration with modern build tools.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Configuration](#configuration)
3. [CSS Architecture](#css-architecture)
4. [Performance Optimization](#performance-optimization)
5. [Development Workflow](#development-workflow)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)
8. [Migration from v3](#migration-from-v3)

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- Vite 7+
- Yarn (recommended for this project)

### Installation Steps

```bash
# Install Tailwind CSS v4 with Vite plugin
yarn add @tailwindcss/vite tailwindcss

# For PostCSS integration (if needed)
yarn add @tailwindcss/postcss
```

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // Additional Vite configuration...
})
```

## Configuration

### Tailwind Config (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom theme extensions
      colors: {
        primary: '#2c3e50',
        secondary: '#3498db',
        accent: '#e74c3c',
        success: '#27ae60',
        warning: '#f39c12',
        background: '#ecf0f1',
        card: '#ffffff',
        text: '#2c3e50',
        'text-light': '#7f8c8d',
        border: '#bdc3c7',
      },
      fontFamily: {
        card: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
```

### CSS Entry Point

```css
/* src/index.css */
@import "tailwindcss";

/* Custom CSS variables for theme */
:root {
  --color-primary: #2c3e50;
  --color-secondary: #3498db;
  --color-accent: #e74c3c;
  --color-success: #27ae60;
  --color-warning: #f39c12;
  --color-background: #ecf0f1;
  --color-card: #ffffff;
  --color-text: #2c3e50;
  --color-text-light: #7f8c8d;
  --color-border: #bdc3c7;
}

/* Custom utility classes */
@layer utilities {
  .text-primary { color: var(--color-primary) !important; }
  .text-secondary { color: var(--color-secondary) !important; }
  .text-accent { color: var(--color-accent) !important; }
  .text-success { color: var(--color-success) !important; }
  .text-warning { color: var(--color-warning) !important; }
  .text-text { color: var(--color-text) !important; }
  .text-text-light { color: var(--color-text-light) !important; }
  .border-border { border-color: var(--color-border) !important; }
}

/* Component styles */
@layer components {
  .btn-primary {
    @apply bg-primary text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-slate-700 hover:-translate-y-0.5;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .btn-secondary {
    @apply bg-secondary text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-600 hover:-translate-y-0.5;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .card {
    background-color: var(--color-card);
    @apply rounded-lg transition-all duration-300 overflow-hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .card:hover {
    @apply -translate-y-0.5;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}
```

## CSS Architecture

### Layer Organization

Tailwind CSS v4 uses a layered approach for better organization:

1. **Base Layer** (`@layer base`): Reset styles and base element styles
2. **Components Layer** (`@layer components`): Reusable component classes
3. **Utilities Layer** (`@layer utilities`): Custom utility classes

### Best Practices for CSS Organization

```css
/* 1. Import Tailwind first */
@import "tailwindcss";

/* 2. Define CSS custom properties */
:root {
  /* Theme colors */
  --color-primary: #2c3e50;
  /* ... other variables */
}

/* 3. Base layer for resets and element styles */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-background text-text;
  }
}

/* 4. Component layer for reusable styles */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
  }
  
  .btn-primary {
    @apply btn bg-primary text-white hover:bg-primary/90;
  }
}

/* 5. Utilities layer for custom utilities */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

## Performance Optimization

### 1. Content Configuration

Always specify content paths to enable tree-shaking:

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Include any other template files
  ],
  // ...
}
```

### 2. JIT (Just-In-Time) Mode

Tailwind CSS v4 uses JIT by default, which only generates the CSS you actually use.

### 3. PurgeCSS Integration

For production builds, ensure unused CSS is removed:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
```

### 4. CSS Optimization

```css
/* Use modern CSS features */
@layer utilities {
  .container-fluid {
    container-type: inline-size;
  }
  
  .grid-auto-fit {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}
```

## Development Workflow

### 1. Hot Module Replacement (HMR)

Tailwind CSS v4 works seamlessly with Vite's HMR:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: true,
  },
})
```

### 2. Development vs Production

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Development-only features
      ...(process.env.NODE_ENV === 'development' && {
        debugScreens: true,
      }),
    },
  },
}
```

### 3. TypeScript Support

For TypeScript projects, add type definitions:

```typescript
// types/tailwind.d.ts
declare module 'tailwindcss' {
  interface Config {
    content: string[];
    theme?: {
      extend?: {
        colors?: Record<string, string>;
        // ... other theme extensions
      };
    };
    plugins?: any[];
  }
}
```

## Common Patterns

### 1. Responsive Design

```jsx
// Use Tailwind's responsive prefixes
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  <div className="p-4 md:p-6 lg:p-8">
    <h2 className="text-lg md:text-xl lg:text-2xl">Title</h2>
  </div>
</div>
```

### 2. Dark Mode

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // or 'media'
  // ...
}
```

```jsx
// Component usage
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  <h1 className="text-gray-900 dark:text-gray-100">Title</h1>
</div>
```

### 3. Component Composition

```jsx
// Create reusable component classes
const Button = ({ variant = 'primary', children, ...props }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

### 4. Custom Animations

```css
@layer utilities {
  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Styles Not Applying

**Problem**: Tailwind classes not working
**Solution**: 
- Check content paths in `tailwind.config.js`
- Ensure `@import "tailwindcss"` is in your CSS entry point
- Verify Vite plugin is properly configured

#### 2. Build Performance Issues

**Problem**: Slow builds or large CSS output
**Solution**:
- Use JIT mode (enabled by default in v4)
- Configure content paths correctly
- Use CSS minification in production

#### 3. HMR Not Working

**Problem**: Hot reload not updating styles
**Solution**:
- Ensure Tailwind plugin is before other CSS plugins
- Check Vite server configuration
- Clear browser cache

#### 4. Custom Classes Not Working

**Problem**: Custom utility classes not applying
**Solution**:
- Use `@layer utilities` for custom utilities
- Ensure proper CSS specificity
- Check for conflicting styles

### Debug Mode

Enable debug mode for development:

```javascript
// tailwind.config.js
export default {
  // ... other config
  ...(process.env.NODE_ENV === 'development' && {
    debugScreens: true,
  }),
}
```

## Migration from v3

### Key Changes in v4

1. **New Architecture**: Tailwind CSS v4 uses a new engine with better performance
2. **Simplified Configuration**: Less configuration needed for most use cases
3. **Better Vite Integration**: Native Vite plugin support
4. **Improved JIT**: Better tree-shaking and performance

### Migration Steps

1. **Update Dependencies**:
   ```bash
   yarn remove tailwindcss postcss autoprefixer
   yarn add @tailwindcss/vite tailwindcss
   ```

2. **Update Configuration**:
   ```javascript
   // Remove postcss.config.js if using @tailwindcss/vite
   // Update vite.config.js to use @tailwindcss/vite plugin
   ```

3. **Update CSS Imports**:
   ```css
   /* Replace @tailwind directives with @import */
   @import "tailwindcss";
   ```

4. **Review Custom Classes**: Ensure custom utilities use `@layer utilities`

### Breaking Changes

- `@tailwind` directives replaced with `@import "tailwindcss"`
- Some utility classes may have changed
- Configuration structure simplified

## Best Practices Summary

1. **Use the Vite Plugin**: `@tailwindcss/vite` provides better integration
2. **Organize CSS in Layers**: Use `@layer` for better organization
3. **Configure Content Paths**: Always specify content for tree-shaking
4. **Use CSS Custom Properties**: For theme values and better maintainability
5. **Optimize for Production**: Enable minification and tree-shaking
6. **Follow Component Patterns**: Create reusable component classes
7. **Use Modern CSS Features**: Leverage container queries, CSS Grid, etc.
8. **Test Responsive Design**: Ensure mobile-first approach
9. **Monitor Bundle Size**: Keep CSS output minimal
10. **Stay Updated**: Follow Tailwind CSS v4 updates and best practices

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS GitHub](https://github.com/tailwindlabs/tailwindcss)
- [Vite Plugin for Tailwind CSS](https://github.com/tailwindlabs/tailwindcss/tree/master/packages/vite)

---

*This guide is based on Tailwind CSS v4.1.11 and Vite 7. Last updated: January 2025* 