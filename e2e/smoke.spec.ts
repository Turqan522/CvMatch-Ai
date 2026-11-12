import {test,expect} from '@playwright/test';
test('logged-out users can open authentication without JavaScript errors',async({page})=>{
 const runtime:string[]=[];page.on('pageerror',e=>{runtime.push(e.message);console.log('PAGE ERROR:',e.message)});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE ERROR:',m.text())});
 await page.goto('./#/login',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(1500);
 console.log('BROWSER DIAGNOSTIC URL:',page.url(),'BODY:',(await page.locator('body').innerText()).slice(0,550),'ROOT:',(await page.locator('#root').innerHTML()).slice(0,550));
 await expect(page.getByRole('heading',{name:'Hesabına daxil ol'})).toBeVisible({timeout:8000});
 await expect(page.getByRole('button',{name:'Daxil ol'}).last()).toBeVisible();
 expect(runtime).toEqual([]);
});
test('registration flow has required fields and navigation works',async({page})=>{
 await page.goto('./#/register',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(1500);
 console.log('BROWSER DIAGNOSTIC URL:',page.url(),'BODY:',(await page.locator('body').innerText()).slice(0,550),'ROOT:',(await page.locator('#root').innerHTML()).slice(0,550));
 await expect(page.getByRole('heading',{name:'Hesab yarat'})).toBeVisible({timeout:8000});
 await expect(page.locator('input[name="name"]')).toBeVisible();
 await expect(page.locator('input[name="email"]')).toBeVisible();
 await page.getByRole('button',{name:/Hesabınız var/}).click();
 await expect(page).toHaveURL(/#\/login/);
 await expect(page.getByRole('heading',{name:'Hesabına daxil ol'})).toBeVisible();
});
test('mobile authentication page has no horizontal overflow and theme switch works',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('./#/login',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(1500);
 console.log('BROWSER DIAGNOSTIC URL:',page.url(),'BODY:',(await page.locator('body').innerText()).slice(0,550),'ROOT:',(await page.locator('#root').innerHTML()).slice(0,550));
 await expect(page.getByRole('heading',{name:'Hesabına daxil ol'})).toBeVisible({timeout:8000});
 await expect(page.locator('.theme-switch')).toBeVisible();
 await page.locator('.theme-switch').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme',/dark|saas/);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
 expect(overflow).toBe(false);
});
