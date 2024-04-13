### VISIT OUR WEBPAGE

https://opinion-magnet.netlify.app/

###  Opinion Magnet
Welcome to Opinion Magnet, your dedicated partner in navigating the intricate landscape of Initial Public Offerings (IPOs). We specialize in feedback and review management, offering indispensable support to unicorn companies embarking on the journey from private funding to the stock market.

### Overview
Unicorn companies typically undergo a rigorous process of raising substantial funds from private investors and venture capital firms before venturing into the public domain. This critical phase is commonly known as the "pre-IPO financing round" or simply the "series financing round." Here, unicorn companies secure significant funding at elevated valuations from investors.

The pinnacle of this pre-public phase is the "Initial Public Offering" (IPO). An IPO signifies the moment when a company decides to make its shares available to the general public, issuing them on the stock market. Subsequently, investors gain the ability to buy and trade these shares on the public exchange.

### Importance of Customer Feedback
In the dynamic world of IPOs, customer feedback emerges as a pivotal asset for investment banks guiding unicorn companies. Positive feedback contributes to building a favorable reputation and instills trust in potential investors. Conversely, negative feedback aids in risk assessment, providing insights that help investors understand and address potential challenges.

Insights derived from customer feedback offer a valuable window into market perception, enabling investors to gauge how a company is positioned. Positive feedback highlights operational efficiency and service quality, offering investors a glimpse into a company's commitment to excellence. Additionally, feedback serves as a crucial source for understanding strategic direction, future growth plans, competitive advantages, and market positioning.

### The Opinion Magnet Advantage
At Opinion Magnet, we go beyond traditional approaches by not only collecting and analyzing data but also translating insights into actionable strategies. Our system incorporates various analyses, providing investment banks with a comprehensive understanding of customer feedback and reviews during the IPO process.

Our analyses offer insights from different perspectives, enhancing the strategic decision-making process. Investment banks can leverage these insights to accentuate a company's strengths or address weaknesses effectively, ensuring a smoother and more successful IPO journey.

Thank you for choosing Opinion Magnet as your partner in navigating the complexities of IPOs. We are committed to empowering your success by turning feedback into actionable strategies.

### PROJECT TECHNICAL OVERVIEW: FEEDBACK PACKAGE
Welcome to the project dedicated to the development of an npm feedback package with a focus on analytics. This section provides a comprehensive understanding of the technical wireframe and explanations for the project.

![OpinionMagnetTechnical Image](OpinionMagnetTechnical.png)

### User Interface (UI) Component
The primary objective of this project is the creation of an npm feedback package, starting with a user interface (UI) component. This component is designed to seamlessly integrate with applications and accepts Company ID, Token, and Access Token as props. The UI component is styled for a polished appearance. Upon clicking a designated button within this component, a feedback form is triggered to appear, facilitating user input.

=> https://github.com/zsaritek/react-opinion-magnet

### Backend Functionality
Upon submission of the feedback form, the backend system comes into play. The form includes the essential information of Token and Company ID, which are forwarded to the backend. The backend authenticates the request using the provided credentials. Successful authentication leads to the storage of the comment in the Comment model. The backend system comprises three key models: Feedback, Company, and User, ensuring a structured and organized data flow.

=> https://github.com/zsaritek/backend-opinion-magnet

#### Company Model
```json 
 {
    name: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'Name is required.']
    },
    accessToken: {
      type: String,
      required: [true, 'Access token is required.']
    }
  }
```

#### Feedback Model
```json
 {
    rating: {
      type: Number,
      required: [true, 'Rating is required.']
    },
    feedback: {
      type: String,
      required: [true, 'Review is required.']
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company'
    }
  }
```

#### User Model
```json
{
    name: {
      type: String,
      required: [true, "Username is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    },
    company: {
      type: Schema.Types.ObjectId, ref: 'Company'
    },
    image: {
      type: String,
      default: "https://res.cloudinary.com/dexnyholt/image/upload/v1706911614/opinion_magnet/avatar_m1jdrw.png"
    },
    meeting: {
      type: String
    }

```

#### API Endpoints/Backend Routes                                         

|      Method | Endpoint                    | Request Body                                  |
|-------------|-----------------------------|-----------------------------------------------|
| POST        | `/api/auth/register`        | - email<br> - password<br> - name<br> - company|
| POST        | `/api/auth/login`           | - email<br> - password                         |
| GET         | `/api/auth/verify`          |                                               |
| GET         | `/api/word-frequency`      |                                               |
| POST        | `/api/feedback`             | - rating<br> - feedback<br> - accessToken<br> - companyId|
| GET         | `/api/feedback`             |                                               |
| GET         | `/api/average`              |                                               |
| GET         | `/api/ratings`              |                                               |
| GET         | `/api/keywords`             |                                               |
| GET         | `/api/clustering`           |                                               |
| PATCH       | `/api/company`              | - body: (empty)                               |
| GET         | `/api/meeting`              |                                               |
| POST        | `/api/meeting`              | - body: meeting                               |
| DELETE      | `/api/meeting`              |                                               |
| GET         | `/api/seed`                 |                                               |



### Admin UI
In addition to the feedback component, an Admin UI is implemented to manage user authentication. After logging into the Admin UI, the system provides a JWT Token for enhanced security. This Admin UI includes a registration page for user log-in. Within the Feedback Page of the Admin UI, comments and ratings are displayed, accompanied by a summary table for efficient monitoring. Furthermore, a dedicated page is designed for generating API tokens, company IDs, and access tokens specifically for the feedback component. The collected information is securely stored in the company model, providing a centralized location for managing crucial data.

Thank you for exploring the technical details of our npm feedback package project. This comprehensive system ensures seamless interaction, secure data handling, and insightful analytics for a robust user experience.

#### Routes 

| Route         | Page                              |
|---------------|-----------------------------------|
| `/`           | Landing Page                      |
| `/usage`      | How Opinion Magnet Works Page     |
| `/register`   | Register Page                     |
| `/login`      | Login Page                        |
| `/dashboard`  | Dashboard Page                    |
| `/profile`    | Profile Page                      |
|               |                                   |

#### All Pages

- Landing Page
- How Opinion Magnet Works Page
- Register Page
- Login Page
- Dashboard Page
- Profile Page
- Strategic Meeting Page
- Company Details Page
- Help Center Page
- Feedback Page
- Analytics Page
- Not Found Page

#### Context

- Auth. context
- Selected Item context

#### Services


| Service           | Methods                          |
|-------------------|----------------------------------|
| Auth Service      | - auth.login(user)               |
|                   | - auth.register(user)            |
|                   | - auth.verify                   |
| Company Service   | - company.upload                 |
|                   | - company.image                  |
| Feedback Service  | - feedback.feedback              |
|                   | - feedback.average               |
|                   | - feedback.keywords              |
|                   | - feedback.clustering            |
|                   | - feedback.ratings               |
| Profile Service   | - profile.upload                 |
|                   | - profile.image                  |





### NPM PACKAGE DETAILS
You can find all details in the below link;
https://www.npmjs.com/package/react-opinion-magnet

- We have used plugin inject for CSS =>https://www.npmjs.com/package/vite-plugin-lib-inject-css
- For adding rating we have used following plugin => https://www.npmjs.com/package/react-simple-star-rating

### INTEGRATING REACT-OPINION-MAGNET INTO YOUR SYSTEM
#### Step 1: Installation

Begin the integration process by installing the react-opinion-magnet package. You can do this effortlessly by running the following command:
```
npm install react-opinion-magnet
```

For detailed instructions, refer to the Npm Registry. Following these instructions ensures a smooth installation process on your page. 

#### Step 2: Configuration

Refer to the illustration below for all the necessary adjustments to the app.jsx file. Customize the content to align with the style of your current page, including any specific measurements or styling preference

#### Step 3: Package Existence Verification

Before proceeding, ensure that react-opinion-magnet is already listed in your package.json file. You can confirm this by checking the package dependencies.

#### Step 4: Register for Full Access

To unlock the full array of services, visit our website and complete the register process. Once registered, you'll be well-prepared to leverage the services outlined above, enhancing user feedback.

### DEMO FEEDBACK APPLICATION

* opinion-magnet-demo: https://codesandbox.io/p/sandbox/opinion-magnet-demo-vyppj3
* api: https://om-seb125.adaptable.app
* admin dashboard: https://opinion-magnet.netlify.app/

You can login to demo account as a user `admin@acme.com` and password `123456Aa`
     

### PROJECT ADMIN UI FLOW

![Project Flow Admin UI Image](ProjectDrawingReadMe.png)

* We incorporated Tailwind CSS and ANT design to achieve a sleek, responsive, and mobile-friendly layout in our React project. Trello served as our primary tool for efficient project planning, while Excalidraw was instrumental in creating mockup wireframes
* This project was created with dedication by "Zeynep Sariteke" and "Sebastian Schwarz".
