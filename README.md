# Lab 8: AI Services and E2E Testing

## Overview
This lab extends Lab 7's chatbot by adding AI service support. Switch between local Eliza responses or Google Gemini AI

## Project Goals
By the end of this lab, I have:
1. Service layer for swapping AI providers
2. Support for Eliza and Gemini 
3. API key management with localStorage
4. Research docs comparing AI providers

## Features
- Switch between Eliza and Gemini AI
- Secure API key input
- Full CRUD from Lab 7
- Automated E2E tests
- Chat history 

## Repository Structure
```
├── index.html                     
├── styles.css                      
├── src/
│   └── js/
│       ├── services/
│       │   ├── AIService.js      
│       │   ├── ElizaService.js     
│       │   ├── GeminiService.js    
│       │   └── ServiceFactory.js  
│       ├── model.js                
│       ├── view.js                 
│       ├── controller.js           
│       ├── app.js                  
│       └── eliza.js               
├── r-n-d/             
│   ├── gemini-test/      
│   ├── openai-test/         
│   └── comparison.md       
├── tests/
│   ├── eliza.spec.js      
│   └── gemini.spec.js           
├── .gitignore                 
├── package.json                
├── playwright.config.js    
├── README.md    
└── LICENSE.md 

```
## License
This project is licensed under the MIT License - see [LICENSE.md](LICENSE) for
details.
## Website Link:
## Author
**Aman Thorat**