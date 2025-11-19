import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'common',
      filename: 'remoteEntry.js',
      exposes: {
        './Sidebar': './src/components/Sidebar.jsx',
        './Header': './src/components/Header.jsx',
        './ProtectedRoute': './src/components/ProtectedRoute.jsx',
        './RoleProtectedRoute': './src/components/RoleProtectedRoute.jsx',
        './AuthPage': './src/components/AuthPage.jsx',
        './Home': './src/pages/Home.jsx',
        './HospitalDetails': './src/components/HospitalDetails.jsx'
      },
      
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
        'react-router-dom': { singleton: true }
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 4173
  }
});