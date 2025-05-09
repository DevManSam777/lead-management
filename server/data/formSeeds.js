/* 
    1.  To create a new seed template, add an object to formSeeds Array.

    2.  format:
     title: "(title)",
     description: "(Description)",
     content: `(Add markdown form content in here within string literal - If you add variables, encase them in double curly braces like this {{firstName}} )`,
     category: "choose one the appropriate categories (contract), (proposal), (invoice), (agreement), (other) ",
    isTemplate: true (Boolean),
    variables: [
    (add variables you used in form)
      "firstName",
      "lastName",
      "fullName",
      "email",
      "phone",
      "businessName",
      "businessEmail",
      "businessPhone",
      "billingAddress"
      "preferredContact",
      "serviceDesired",
      "estimatedBudget",
      "totalBudget",
      "paidAmount",
      "remainingBalance",
      "currentDate",
      "createdAt"
        ],
    },
*/
const formSeeds = [
  {
    title: "Web Development Agreement",
    description: "Standard contract for web development services",
    content: `# Web Development Agreement
  
  ## Between {{businessName}} and {{fullName}}
  
  **Date:** {{currentDate}}
  
  This Web Development Agreement is made between {{businessName}} ("Client") and {{fullName}} ("Developer").
  
  ### 1. Services
  
  Developer agrees to design, create, and deliver a website according to the specifications outlined below:
  
  - Project scope: {{serviceDesired}}
  - Estimated timeline: 8-10 weeks
  - Budget: {{billedAmount}}
  
  ### 2. Payment
  
  Total project cost: {{billedAmount}}
  Deposit due upon signing: 50% of total
  Remaining balance due upon completion: {{remainingBalance}}
  
  ### 3. Term and Termination
  
  This agreement begins on {{currentDate}} and continues until project completion.
  
  ### 4. Ownership
  
  Upon receiving full payment, Developer transfers all rights to the completed website to Client.
  
  ### 5. Contact Information
  
  Client Name: {{fullName}}
  Client Email: {{email}}
  Client Phone: {{phone}}
  Preferred Contact Method: {{preferredContact}}
  
  ### Signatures
  
  ________________________
  {{fullName}}, Client
  
  ________________________
  Developer
  
  `,
    category: "contract",
    isTemplate: true,
    variables: [
      "businessName",
      "fullName",
      "currentDate",
      "serviceDesired",
      "billedAmount",
      "remainingBalance",
      "email",
      "phone",
      "preferredContact",
    ],
  },
  {
    title: "California Contract Killer",
    description: "A plain language web development contract",
    content: `# The Contract 
 
### Date: {{currentDate}}  
#### Between: **(Developer)**  
  
#### And {{businessName}}  
   
## Summary:  
I will always do my best to fulfill your needs and meet your expectations, but it’s important to have things written down so that we both know what’s what, who should do what and when, and what will happen if something goes wrong.  
  
In this contract you won’t find any complicated legal terms or long passages of unreadable text. I would never want to trick you into signing something that you might later regret. What I do want is what’s best for both parties, now and in the future.  
  
In short;  
  
(“You”), {{businessName}}, located at:  
  
{{billingAddress}}  
  
 are hiring me (“Me”) (Developer) for: 
##### {{serviceDesired}}  
  
For the estimated total price of {{estimatedBudget}} as outlined in our previous correspondence.  
  
## What do both parties agree to?
**You**: You have the authority to enter into this contract on behalf of yourself, your company or your organization. You will give me the assets and information that I tell you I need to complete the project. You’ll do this when I ask and provide it in the formats I ask for. You’ll review my work, provide feedback and approval in a timely manner too. We will both be bound by dates we set together. You also agree to stick to the payment schedule set out at the end of this contract.  
  
**Me**: I have the experience and ability to do everything I’ve discussed with you and I will do it all in a professional and timely manner. I will do my best to meet every deadline that’s set, and I will maintain the confidentiality of everything you give me.  
  
## Design
I create designs that adapt to the capabilities of many devices and screen sizes. I create them iteratively using HTML and CSS, and it would be a poor use of my time to mock up every template as a static visual. I may use visuals to indicate a creative direction (color, texture and typography).  
  
You will have plenty of opportunities to review my work and provide feedback. I will share a Github repository and development site with you and we will have regular contact via phone, email, or any video chat provider we agree to, such as Zoom or Skype.  
  
If, at any stage, you change your mind about what you want delivered or aren’t happy with the direction my work is taking, you will pay me in full for the time I've spent working until that point and may terminate this contract.  
  
## Text content  
Unless agreed separately, I am not responsible for inputting text or images into your content management system or creating every page on your website. I do provide professional copywriting and editing services, so if you’d like me to create new content or input content for you, I will provide a separate estimate.  
  
## Graphics and photographs
You should supply graphic files in an editable, vector digital format. You should supply photographs in a high resolution digital format. If you choose to buy stock photographs, I can suggest stock libraries. If you’d like me to search for photographs for you, I can provide a separate estimate.  

## HTML, CSS and JavaScript
I deliver pages developed from HTML markup, CSS stylesheets for styling and JavaScript for behavior.  
  
## Browser testing
Browser testing no longer means attempting to make a website look the same in browsers of different capabilities or on devices with different size screens. It does mean ensuring that a person’s experience of a design should be appropriate to the capabilities of a browser or device.  
  
I test my work in current versions of major desktop browsers including those made by Apple (Safari), Google (Chrome), Microsoft (Edge), and Mozilla Firefox. I will not test in other older browsers unless we agreed separately. If you need an enhanced design for an older browser, I can provide a separate estimate for that.  
  
## Mobile browser testing
Testing using popular smaller screen devices is essential in ensuring that a person’s experience of a design is appropriate to the capabilities of the device they’re using. I test my designs in:  
  
iOS: Safari and Google Chrome  
Android: Google Chrome  
  
I will not test in Opera Mini/Mobile, specific Android devices, or other mobile browsers.  
  
## Technical support
I am not a website hosting company so I do not offer support for website hosting, email or other services relating to hosting. You may already have professional hosting. If you don’t, I will recommend one of my preferred hosting providers. I can set up your site on a server if you'd like, and will provide a separate estimate for that. Then, the updates to, and management of that server will be up to you.  
  
For most projects, I prefer a serverless solution to save us both time and money. This means your website is hosted in the cloud and so there is no need for server management. I will recommend this option when I feel it is appropriate.  
  
## Search engine optimization (SEO)
I do not guarantee improvements to your website’s search engine ranking, but the pages that I develop are accessible to search engines. I do offer search engine optimization services, and can provide a separate estimate for that.  

## Changes and revisions
I do not want to limit your ability to change your mind. The price at the beginning of this contract is based on the amount of time that I estimate I'll need to accomplish everything you’ve told me you want to achieve, but I'm happy to be flexible. If you want to change your mind or add anything new, that won’t be a problem as I will provide a separate estimate for the additional time.  

## Legal stuff
I will carry out my work in accordance with good industry practice and at the standard expected from a suitably qualified person with relevant experience. That said, I can’t guarantee that my work will be error-free and so I can’t be liable to you or any third party for damages, including lost profits, lost savings or other incidental, consequential or special damages, even if you’ve advised me of them.  
  
Your liability to me will also be limited to the amount of fees payable under this contract and you won’t be liable to me or any third party for damages, including lost profits, lost savings or other incidental, consequential or special damages, even if I’ve advised you of them.  
  
Finally, if any provision of this contract shall be unlawful, void, or for any reason unenforceable, then that provision shall be deemed severable from this contract and shall not affect the validity and enforceability of any remaining provisions.  
  
## Intellectual property rights
“Intellectual property rights” means all patents, rights to inventions, copyright (including rights in software) and related rights, trademarks, service marks, get up and trade names, internet domain names, rights to goodwill or to sue for passing off, rights in designs, database rights, rights in confidential information (including know-how) and any other intellectual property rights, in each case whether registered or unregistered and including all applications (or rights to apply) for, and renewals or extensions of, such rights and all similar or equivalent rights or forms of protection which subsist or shall subsist now or in the future in any part of the world.  
  
First, you guarantee that all elements of text, images or other artwork you provide are either owned by you, or that you have permission to use them. When you provide text, images or other artwork to me, you agree to protect me from any claim by a third party that I'm using their intellectual property.  
  
I guarantee that all elements of the work I deliver to you are either owned by me or I’ve obtained permission to provide them to you. When I provide text, images or other artwork to you, I agree to protect you from any claim by a third party that you’re using their intellectual property. Provided you’ve paid for the work and that this contract hasn’t been terminated, I will assign all intellectual property rights to you as follows:  
  
You’ll own the website I design for you plus the visual elements that I create for it. I’ll give you source files and finished files and you should keep them somewhere safe as I am not required to keep a copy. You own all intellectual property rights of text, images, site specification and data you provided, unless someone else owns them.  
  
I will own any intellectual property rights I’ve developed prior to, or developed separately from this project and not paid for by you. I will own the unique combination of these elements that constitutes a complete design and I’ll license its use to you, exclusively and in perpetuity for this project only, unless we agree otherwise.  
  
## Displaying my work
I love to show off my work, so I reserve the right to display all aspects of my creative work, including sketches, work-in-progress designs and the completed project on my portfolio and in articles on websites, in magazine articles and in books.  
  
## Payment schedule
You agree to pay for my services as outlined in the following payment schedule:  
  
50% deposit before work begins  
Remaining 50% upon completion  
  
I issue invoices electronically. My payment terms are 30 days from the date of invoice by Venmo or PayPal. All proposals are quoted in US dollars.  
  
I reserve the right to charge interest on all overdue debts at the rate of 5% per month or part of a month.  
  
## The not-so-small print
Neither of us can transfer this contract to anyone else without the other’s permission.  
  
We both agree that we’ll adhere to all relevant laws and regulations in relation to our activities under this contract and not cause the other to breach any relevant laws or regulations.  
  
This contract stays in place and need not be renewed. If for some reason one part of this contract becomes invalid or unenforceable, the remaining parts of it remain in place.  
  
Although the language is simple, the intentions are serious and this contract is a legally binding document.  
  
## The dotted line  
  
X 
……………………………………………………
Signed by  (Developer), {{currentDate}}  
  
X……………………………………………………
Signed by {{fullName}}, {{currentDate}}  `,
    category: "contract",
    isTemplate: true,
    variables: [
      "businessName",
      "fullName",
      "currentDate",
      "serviceDesired",
      "billedAmount",
      "estimatedBudget",
    ],
  },
  {
    title: "Web Development Proposal",
    description: "Project proposal template for new clients",
    content: `# Web Development Proposal
  
  ## Prepared for {{businessName}}
  
  **Prepared by:** Your Name
  **Date:** {{currentDate}}
  
  Dear {{fullName}},
  
  Thank you for considering our services for your web development needs. We're excited to present this proposal for {{serviceDesired}}.
  
  ## Project Understanding
  
  Based on our discussions, you need a professional website that will help your business grow online. Your website will include:
  
  - Professional design aligned with your brand
  - Mobile-responsive layout
  - Content management system
  - Contact form
  - Basic SEO optimization
  
  ## Timeline and Milestones
  
  - Discovery and Planning: 1-2 weeks
  - Design Phase: 2-3 weeks
  - Development Phase: 3-4 weeks
  - Testing and Revisions: 1-2 weeks
  - Launch: 1 week
  
  Total estimated timeline: 8-12 weeks from project start date.
  
  ## Investment
  
  Project Fee: {{billedAmount}}
  
  Payment Schedule:
  - 50% deposit to begin work
  - 25% upon design approval
  - 25% upon project completion
  
  ## Next Steps
  
  To proceed with this project, please:
  1. Review this proposal
  2. Sign the attached agreement
  3. Submit the initial deposit
  
  We look forward to working with you on this exciting project!
  
  Regards,
  
  Your Name
  Web Developer
  `,
    category: "proposal",
    isTemplate: true,
    variables: [
      "businessName",
      "fullName",
      "currentDate",
      "serviceDesired",
      "billedAmount",
    ],
  },
  {
    title: "Invoice Template",
    description: "Standard invoice for client billing",
    content: `# INVOICE
  
  **From:** Your Company Name
  **To:** {{businessName}}
  **Attention:** {{fullName}}
  **Date:** {{currentDate}}
  **Invoice #:** INV-00001
  
  ## Services Rendered
  
  | Description | Amount |
  |-------------|--------|
  | {{serviceDesired}} | {{billedAmount}} |
  | | |
  | **Total Due:** | **{{billedAmount}}** |
  
  **Amount Paid:** {{paidAmount}}
  **Remaining Balance:** {{remainingBalance}}
  
  ## Payment Information
  
  Please remit payment within 15 days to:
  
  Bank Name: Your Bank
  Account Name: Your Account
  Account Number: XXXXXXXX
  Routing Number: XXXXXXXX
  
  Or pay online at: www.yourcompany.com/pay
  
  ## Thank You!
  
  We appreciate your business!
  
  If you have any questions about this invoice, please contact:
  email@example.com | (555) 123-4567
  `,
    category: "invoice",
    isTemplate: true,
    variables: [
      "businessName",
      "fullName",
      "currentDate",
      "serviceDesired",
      "billedAmount",
      "paidAmount",
      "remainingBalance",
    ],
  },
  {
    title: "Website Maintenance Agreement",
    description: "Agreement for ongoing website maintenance services",
    content: `# Website Maintenance Agreement
  
  ## Between {{businessName}} and {{fullName}}
  
  **Date:** {{currentDate}}
  
  This Website Maintenance Agreement is made between {{businessName}} ("Client") and {{fullName}} ("Provider").
  
  ### 1. Services
  
  Provider agrees to perform the following website maintenance services:
  
  - Regular website updates and content changes
  - Security monitoring and updates
  - Performance optimization
  - Backup management
  - Technical support
  
  ### 2. Term
  
  This agreement begins on {{currentDate}} and continues for 12 months, with automatic renewal unless terminated by either party with 30 days written notice.
  
  ### 3. Payment
  
  Monthly maintenance fee: $___________
  Billing cycle: Monthly, due on the 1st of each month
  
  ### 4. Response Time
  
  Provider will respond to maintenance requests within 24-48 business hours.
  
  ### 5. Contact Information
  
  Client Name: {{fullName}}
  Client Email: {{email}}
  Client Phone: {{phone}}
  Preferred Contact Method: {{preferredContact}}
  
  ### Signatures
  
  ________________________
  {{fullName}}, Client
  
  ________________________
  Provider
  
  `,
    category: "agreement",
    isTemplate: true,
    variables: [
      "businessName",
      "fullName",
      "currentDate",
      "email",
      "phone",
      "preferredContact",
      "remainingBalance",
    ],
  },
  {
    title: "Test",
    description: "test for other category",
    content: `# Test
    
{{currentDate}}`,
    category: "other",
    isTemplate: true,
    variables: ["currentDate"],
  },
];

module.exports = formSeeds;
