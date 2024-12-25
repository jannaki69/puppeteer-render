const puppeteer = require("puppeteer");
const NodeMailer = require('nodemailer');
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async');
const { application } = require("express");

//require("dotenv").config();

var numberOfEmails = 0;
var lastEmailTime = new Date(Date.now());
const arrDutiesFound = [];

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
    res.send(`FINISHED RUNNING PUPPETEER`);
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
    console.log("numberOfEmails   " + numberOfEmails.toString());
    console.log("lastEmailTime   " + lastEmailTime.toString()); // + "  =  " + lastEmailTime.toDateString());
    //const page = await browser.newPage();
    
    await page.goto(openDutiesText);
    //await page.goto('file:///C:/Users/janna/VS/w3school/SISCOG Web App c2 en reservert en ledig.html');
    //await page.goto('file:///C:/Users/janna/VS/w3school/SISCOG Web App c2.html');
    
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
      lastEmailTime = new Date(Date.now());
    }
        
    if (numberOfEmails > 1)
    {
      console.log(minutesSinceLastEmail.toString() + " minutes since last email and no of emails > 1");
    }
    else
    {
  
      await page.reload();
      console.log("RELOAD done " + page.url().toString());
      page.once('load', () => console.log('Page loaded!'));
      

      if ('https://tpowebservice.nsb.no:8501/app/login' == page.url().toString()) 
      {
        await loginPage(page);
      }
      
      await page.reload();
      console.log("......RELOAD 2 done " + page.url().toString());

      page.once('load', () => console.log('Page loaded!'));
      let found=false;
      
      const sleep =(ms=30000) => new Promise(resolve => setTimeout(resolve, ms));
      await sleep(10000);

      //await page.waitForSelector('.mini-card');
      //await page.waitForSelector('.duty-hours');
     
      
      const extractedTextTest = await page.$eval('*', (el) => el.innerText);

      console.log("TEST:");
      console.log(extractedTextTest);

      // Example text with newline characters
      //const textExtracted = extractedTextTest.toString();


// Split the text into an array using the newline character
const linesArray = extractedTextTest.split('\n');

console.log(linesArray);

const arrItemFound = [];
var availableDutyFoundAndAdded = false;
for (let i=0; i < linesArray.length; i++)
{
  const numberOfDInLine = findNumberBeforeWord(linesArray[i], 'ledig');
  if (numberOfDInLine!=null)
    if (numberOfDInLine>0)
    {
      const wasAnotherAdded = addItemIfNotExists(arrDutiesFound, linesArray[i]);
      //arrDutiesFound.push(linesArray[i]);
      if (wasAnotherAdded)
        availableDutyFoundAndAdded=true;
    }
//  console.log(`Number of cars: ${numberOfCars}`);

}


      
/*
      const nodedutyhours = await page.evaluate(() => {
        return document.querySelectorAll('.duty-hours');
        });

        //let miniD = await page.$$('.duty-hours');
      
        let miniD2 = await page.$$('.panel-heading');

        for (let i = 0; i < miniD2.length; i++) {

          let itemJsHandle = await miniD2[i].getProperty('innerText');
          let itemText = await itemJsHandle.jsonValue();
          
          if (!itemText.includes("Filter"))
            if (arrDutiesFound.includes(itemText))
              arrItemFound[i] = true;
            else 
            {
              arrDutiesFound.push(itemText);
            };

          console.log(itemText + " arrayLength " + arrDutiesFound.length.toString());
        };
*/

      //const nodeList = page.querySelectorAll(".mini-card");
/*
      for (let i = 0; i < miniD.length; i++) {

        let itemJsHandle = await miniD[i].getProperty('innerText');
        let itemText = await itemJsHandle.jsonValue();
        console.log(itemText);

      }
      */
     //nodeList.forEach((item) => {
      //console.log(item.innerText);
      //});
/*
      let duties = await page.$$('.mini-card');
      //const nodeList = page.querySelectorAll(".mini-card");
      for (let i = 0; i < duties.length; i++) {
        console.log(duties[i].innerText);
        let element = duties[i];

      }
 */     
/*
      let urls = await page.evaluate(() => {
        let results = [];
        let items = document.querySelectorAll('.mini-card');
        items.forEach((item) => {
          console.log(item.innerText);
            //results.push({
            //    url:  item.getAttribute('href'),
            //    text: item.innerText,
            //}
            //);
        });
        return results;
    })
*/
      const extractedText = await page.$eval('*', (el) => el.innerText);

      console.log("INNER TEXT 1:");
      console.log(extractedText);
/*
      const extractedText2 = await page.$eval('*', (el) => el.innerHTML);
      console.log("INNER HTML:");
      console.log(extractedText2);
  */    
      let t = String(extractedText).toUpperCase();
      let position1 = t.search("DUTIES AVAILABLE");
      //let position2 = t.search("Det finnes ingen ledige eller reserverte dagsverk".toUpperCase());
      if (position1 != -1  )
        {
          found=true;
          //console.log("Found .." + position1.toString() + "  " + position2.toString());
        }

      if (found && availableDutyFoundAndAdded) 
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
          //to: 'jannaki69@hotmail.com; jannaki69@gmail.com',
          to: 'voudas1941@gmail.com',
          subject: 'Sending Email using Node.js',
          text: 'That was easy!' + numberOfEmails.toString()
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            lastEmailTime= new Date(Date.now());
            numberOfEmails++;
            console.log("HØØØØØØ");
            console.log('Email sent: ' + info.response + "  Time=  " + lastEmailTime.toDateString() + "  No of emails= " + numberOfEmails.toString());
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
    //res.send(`Something went wrong while running Puppeteer: ${e}`);
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
          lastEmailTime = new Date(Date.now());
        }
        
        if (numberOfEmails > 4)
        {
          console.log(minutesSinceLastEmail.toString() + " minutes since last email and no of emails > 1");
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
          console.log("INNER TEXT 2:");
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
                lastEmailTime= new Date(Date.now());
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
    //res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    //await browser.close();
  }
};

async function loginPage(page){
try{
  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  await page.type('#username', 'ikoutsileos');
  //await page.type("input[type=text]", "username");
  await page.type('#password', '13Panathinaikos');
  //await page.type("input[type=password]", "password");

  await page.click("button[type=submit]");
  //await page.click('#submit');

  await page.waitForNavigation(); // <------------------------- Wait for Navigation
  const sleep =(ms=30000) => new Promise(resolve => setTimeout(resolve, ms));
  await sleep(30000);

  await page.goto(openDutiesText);

  console.log('Login password done. New Page URL:', page.url());
}
  catch (e) 
  {
    console.error(e);
    //res.send(`Something went wrong while LOGIN: ${e}`);
  };  
};

// Function to find the number in front of a specific word
function findNumberBeforeWord(text, word) {
  // Create a regular expression to match a number followed by the specific word
  const regex = new RegExp(`(\\d+)\\s+${word}`, 'i');
  const match = text.match(regex);

  // If a match is found, return the number; otherwise, return null
  return match ? parseInt(match[1], 10) : null;
}

// Function to check if an item exists in the array, and if not, add it
function addItemIfNotExists(arr, item) {
  // Check if the item is already in the array
  if (!arr.includes(item)) {
      // If the item is not in the array, add it
      arr.push(item);
      return true; // Indicate the item was added
  }
  return false; // Indicate the item was already present
}

// Function to find the text between two specified words
function findTextBetweenWords(text, startWord, endWord) {
  // Create a regular expression to match the text between the start and end words
  const regex = new RegExp(`${startWord}(.*?)${endWord}`, 'i');
  const match = text.match(regex);

  // If a match is found, return the captured group; otherwise, return null
  return match ? match[1].trim() : null;
}

// Example usage
const text = "The quick brown fox jumps over the lazy dog.";
const startWord = "quick";
const endWord = "over";

const result = findTextBetweenWords(text, startWord, endWord);
console.log(`Text between "${startWord}" and "${endWord}": ${result}`);
// Output: Text between "quick" and "over": brown fox jumps


module.exports = { scrapeLogic };
