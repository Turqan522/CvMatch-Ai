import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./e2e',
 timeout:30000,retries:1,
 use:{baseURL:'http://127.0.0.1:4173/CvMatch-Ai/',headless:true,trace:'retain-on-failure'},
 projects:[{name:'chromium',use:{browserName:'chromium'}}],
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4173',url:'http://127.0.0.1:4173/CvMatch-Ai/',reuseExistingServer:!process.env.CI,timeout:90000},
 reporter:'list'
});
