const puppeteer = require("puppeteer");
const NodeMailer = require('nodemailer');
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async');
const { application } = require("express");

//require("dotenv").config();

var numberOfEmails = 0;
var lastEmailTime = new Date();

console.log('executablePath = .... ' + puppeteer.executablePath().toString());
var openDutiesText = 'https://tpowebservice.nsb.no:8501/app/open-duties';

const scrapeLogic = async (res) => 
{
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });


  try 
  {
    const page = await browser.newPage();
    await searchDuties(page);
    await browser.close();
  } 
  catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

async function searchDuties(page){

  try 
  {
    //const page = await browser.newPage();
    await page.goto(openDutiesText);

    var timeNow = Date.now();
    var timeDiff = timeNow - lastEmailTime; //in ms
    // strip the ms
    timeDiff /= (1000*60);

    // get seconds 
    var minutesSinceLastEmail = Math.round(timeDiff);

    if (minutesSinceLastEmail > 30)
    {
      //reset
      numberOfEmails = 0;
      lastEmailTime = Date.now();
    }
        
    if (numberOfEmails > 1)
    {
      console.log(minutesSinceLastEmail.toString() + " minutes since last email and no of emails > 4");
    }
    else
    {
  
      await page.reload();
      console.log("RELOAD done " + page.url().toString());

      //await page.goto('file:///C:/Users/janna/VS/w3school/SISCOG Web App c2 en reservert en ledig.html');

      if ('https://tpowebservice.nsb.no:8501/app/login' == page.url().toString()) 
      {
        await loginPage(page);
      }
      
      //page.once('load', () => console.log('Page loaded!'));
      let found=false;
      
      const sleep =(ms=30000) => new Promise(resolve => setTimeout(resolve, ms));
      await sleep(10000);

      const extractedText = await page.$eval('*', (el) => el.innerText);
      //console.log("INNER TEXT:");
      //console.log(extractedText);

      //const extractedText2 = await page.$eval('*', (el) => el.innerHTML);
      //console.log("INNER HTML:");
      //console.log(extractedText2);
      
      let t = String(extractedText).toUpperCase();
      let position1 = t.search("DUTIES AVAILABLE");
      let position2 = t.search("Det finnes ingen ledige eller reserverte dagsverk".toUpperCase());
      if (position1 != -1  )
        {
          found=true;
          //console.log("Found .." + position1.toString() + "  " + position2.toString());
        }

      if (found) 
      {
        console.log('FOUND AVAILABLE dutie');

        var transporter = NodeMailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'jannaki69@gmail.com',
            pass: 'qopo mxog serg xmur'
          }
        });

        var mailOptions = {
          from: 'jannaki69@gmail.com',
          to: 'jannaki69@hotmail.com; jannaki69@gmail.com',
          subject: 'Sending Email using Node.js',
          text: 'That was easy!' + numberOfEmails.toString()
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
              lastEmailTime= Date.now();
              numberOfEmails++;
          }
          });
      }
      else
      {
        numberOfEmails = 0;
      };
        
      const d = new Date();
      var text = d.toDateString() + ' ' + d.toTimeString();
      
      console.log(text);
    }
  } 
  catch (e) 
  {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  };
};

async function searchDutiesPeriodically(page){

  try {
    //const page = await browser.newPage();
    await page.goto(openDutiesText);

    setIntervalAsync
    (
      
      async () => 
      {
        var timeNow = Date.now();
        var timeDiff = timeNow - lastEmailTime; //in ms
        // strip the ms
        timeDiff /= (1000*60);

        // get seconds 
        var minutesSinceLastEmail = Math.round(timeDiff);

        if (minutesSinceLastEmail > 30)
        {
          //reset
          numberOfEmails = 0;
          lastEmailTime = Date.now();
        }
        
        if (numberOfEmails > 4)
        {
          console.log(minutesSinceLastEmail.toString() + " minutes since last email and no of emails > 4");
        }
        else
        {
          await page.reload();
          console.log("RELOAD done " + page.url().toString());

          //await page.goto('file:///C:/Users/janna/VS/w3school/SISCOG Web App c2 en reservert en ledig.html');

          if ('https://tpowebservice.nsb.no:8501/app/login' == page.url().toString()) 
          {
            await loginPage(page);
          }
          
          //page.once('load', () => console.log('Page loaded!'));
          let found=false;
          
          const sleep =(ms=30000) => new Promise(resolve => setTimeout(resolve, ms));
          await sleep(30000);

          const extractedText = await page.$eval('*', (el) => el.innerText);
          console.log("INNER TEXT:");
          console.log(extractedText);

          //const extractedText2 = await page.$eval('*', (el) => el.innerHTML);
          //console.log("INNER HTML:");
          //console.log(extractedText2);
          
          let t = String(extractedText).toUpperCase();
          let position1 = t.search("DUTIES AVAILABLE");
          //let position2 = t.search("Det finnes ingen ledige eller reserverte dagsverk");
          if (position1 != -1  )
            {
              found=true;
              //console.log("Found .." + position1.toString() + "  " + position2.toString());
            }

          if (found) 
          {
            console.log('FOUND AVAILABLE dutie');
            
            var transporter = NodeMailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'jannaki69@gmail.com',
                pass: 'qopo mxog serg xmur'
              }
            });

            var mailOptions = {
              from: 'jannaki69@gmail.com',
              to: 'jannaki69@hotmail.com',
              subject: 'Sending Email using Node.js',
              text: 'That was easy!'
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
                lastEmailTime= Date.now();
                numberOfEmails++;
              }
            });
          }
          else
          {
            numberOfEmails = 0;
          }  
          //await browser.close();
          
          const d = new Date();
          var text = d.toDateString() + ' ' + d.toTimeString();
          
          console.log(text);
        };
      }, 1*60*1000
    );

   
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    //await browser.close();
  }
};

async function loginPage(page){
  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  await page.type('#username', 'ikoutsileos');
  //await page.type("input[type=text]", "username");
  await page.type('#password', '13Panathinaikos');
  //await page.type("input[type=password]", "password");

  await page.click("button[type=submit]");
  //await page.click('#submit');

  await page.waitForNavigation(); // <------------------------- Wait for Navigation
  await page.goto(openDutiesText);

  console.log('Login password done. New Page URL:', page.url());
};


module.exports = { scrapeLogic };
