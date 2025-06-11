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
      "billedAmount",
      "paidAmount",
      "remainingBalance",
      "currentDate",
      "createdAt"
        ],
    },
*/
const formSeeds = [
  {
    title: "Independent Developer Contract",
    description: "Courtesy of Vish Singh",
    content: `# INDEPENDENT DEVELOPER CONTRACT

This Independent Developer Contract (the "Contract") is made as of {{currentDate}} between {{businessName}} with its principal place of business located at {{billingAddress}} (the "Client") and [DEVELOPER NAME], located at [DEVELOPER PLACE OF BUSINESS] (the "Developer").

**WHEREAS**, Client requests the Developer to perform services for it and may request the Developer to perform other services in the future; and

**WHEREAS**, the Client and the Developer desire to enter into a contract, which will define respective rights and duties as to all services to be performed;

**NOW, THEREFORE**, in consideration of covenants and agreements contained herein, the parties hereto agree as follows:

## 1. Services

Effective [SERVICES COMMENCEMENT DATE] Client shall retain the Developer and the Developer shall provide Client with services (the "Services"), which shall include, without limitation:

**DESCRIBE SERVICES OR REFERENCE ATTACHMENT HERE.**

### Timeframe
The Developer will use commercially reasonable efforts to perform the Services within the schedule outlined in Services above. The Developer's delivery timeframe depends upon the Client's prompt response to any questions or requests for Client materials.

### Testing & Acceptance
The Developer shall use commercially reasonable efforts to test deliverables before providing them to the Client.

The Client shall promptly review all deliverables, and must notify the Developer of any failure to conform to the Services within 5 business days of receipt. If the Developer does not receive a timely notification, the deliverable will be deemed accepted. The Client's notification must clearly identify the problems with the Deliverable.

### Client Responsibilities
Client must promptly: (a) coordinate any decision-making activities with 3rd parties; (b) provide Client Content in a form suitable for reproduction or incorporation into the Deliverables; and (c) proofread deliverables.

### Client Representations
Client represents and warrants to the Developer that:
* Client owns sufficient right, title, and interest in the Client Content to permit the Developer's use of the Client Content in performing the Services,
* To the best of Client's knowledge, the Developer's use of the Client Content will not infringe the rights of any third party,
* Client shall comply with the terms and conditions of any licensing agreements which govern the use of Third Party Materials, and
* Client shall comply with all laws and regulations governing the Services and Deliverables.

### Developer Representations
The Developer represents and warrants to Client that:
* The final deliverables will be the Developer's original creative work, except that the Developer may incorporate Client Content, work from their Developer Agents and third party material (for example, stock photos, or Software as a Service).
* For any final deliverable that includes the work of independent developers or third party material, the Developer shall secure sufficient rights for Client to use the final deliverables for their intended purpose.
* To the best of the Developer's knowledge, the final deliverables will not infringe upon the IP rights of any third party. However, the Developer will not be conducting any type of IP clearance search (for example, the Developer will not be conducting a copyright, trademark, patent or design patent clearance search).

## 2. Changes

(a) **Change Requests.** The Client, without invalidating this Contract, may request changes in the work within the general scope of the Contract consisting of additions, deletions, or other revisions.

(b) **Adjustments to Compensation.** In the event that any such changes materially impact the cost to the Developer of performing the Services or the time required for such performance, the parties shall negotiate in good faith a reasonable and equitable adjustment in the applicable Fees and schedule, as applicable.

(c) **New Scope.** If the Change Request alters the scope of the project by more than 20%, the Developer may submit a new proposal to the Client.

## 3. Compensation

### Project Rate Option
(a) **Project Amount.** The work performed by the Developer shall be performed at the rate set forth below, and not exceed the total estimated amount specified below:

Project fee: $ {{estimatedBudget}}  
Additional hourly rate (if requested by the company for additional work or changes): [PROJECT HOURLY RATE]

(b) **Payment.** Invoices shall be issued to Client by the Developer. 40% of the project fee will be paid at the start of the project. 40% will be paid upon successful completion of the project. The remaining 20% shall be paid following final implementation of the project including any agreed upon training, documentation, debugging, app store submission, store approval and testing. All payments shall be due 14 business days after receipt of invoices.

(c) **Taxes.** Client shall not be responsible for federal, state and local taxes derived from the Developer's net income or for the withholding and/or payment of any federal, state and local income and other payroll taxes, workers' compensation, disability benefits or other legal requirements applicable to the Developer.

## 4. Expenses

(a) **Payment.** A Client shall reimburse the Developer for all pre-approved, reasonable and necessary expenses, including, without limitation, domestic and foreign travel, lodging and meal expenses incurred in connection with the Services.

(b) **Substantiation.** The Developer shall provide Client with documentation supporting all expenses.

(c) **Payment.** Client shall reimburse the Developer within 14 days upon receipt of a request for reimbursement from the Developer.

## 5. Client Rights in Deliverables

(a) **IP Assignment.** Upon completion of the Services and full payment of all invoices, the Developer shall assign IP rights to the Client. These IP rights include all ownership rights, including any copyrights, in any artwork, designs and software created by the Developer and incorporated into a final deliverable, except as otherwise noted in this Contract.

## 6. Developer Rights in Deliverables

(a) **Preliminary Works.** The Developer retains the rights to all preliminary works that are not incorporated into a final deliverable.

(b) **Developer Portfolio.** The Developer may display the deliverables in the Developer's portfolios and websites, and in galleries, design periodicals and other exhibits for the purposes of professional recognition. Likewise, the Developer may publicly describe their role in the project.

(c) **Credit.** If the Developer incorporates credits into the deliverables, any use of the deliverables shall continue to bear the credits in the same form, size and location. Developer credits will not be incorporated into any logo designed for the Client.

(d) **Developer Tools.** The Developer may incorporate certain Developer Tools into the deliverables.
   
   (i) "Developer Tools" means all programming, deployment, database or design tools developed or utilized by the Developer in performing the Services, including without limitation: pre-existing and newly developed software, web authoring tools, type fonts, and application tools.
   
   (ii) In the event Developer Tools are incorporated into any final deliverable, then the Developer grants Client a royalty-free, perpetual, worldwide, non-exclusive license to use the Developer Tools to the extent necessary to use the final deliverables. The Developer retains all other rights in the Developer Tools.

## 7. Independent Contractor Status

(a) **Status.** The Developer is an independent contractor of Client. Nothing contained in this Contract shall be construed to create the relationship of employer and employee, principal and agent, partnership or joint venture, or any other fiduciary relationship.

(b) **No Authority.** The Developer shall have no authority to act as agent for, or on behalf of, Client, or to represent Client, or bind Client in any manner.

(c) **No Employee Benefits.** The Developer shall not be entitled to worker's compensation, retirement, insurance or other benefits afforded to employees of Client.

## 8. Developer and Client Relationship

(a) **Non-Exclusive.** This Contract does not create an exclusive relationship. The deliverables are not a "work for hire" under Copyright Law.

(b) **No Assignment.** Neither party may assign its rights or obligations under this Contract without the prior written consent of the other party. Any such attempted assignment will be void ab initio. Consent is not required for a disposition of substantially all assets of the assigning party's business.

## 9. Representations and Warranties
The Client and the Developer respectively represents and warrants to each other that each respectively is fully authorized and empowered to enter into the Contract and that their entering into the Contract and to each parties' knowledge the performance of their respective obligations under the Contract will not violate any agreement between the Client or the Developer respectively and any other person, firm or organization or any law or governmental regulation.

## 10. Confidential Information
Each party shall maintain Confidential Information in strict confidence, and shall not use Confidential Information except (a) as necessary to perform its obligations under the Contract, or (b) as required by a court or governmental authority. Confidential Information includes proprietary technical and business information, preliminary works, and any other information marked "Confidential."

**Exception.** Confidential Information does not include (a) any information that is in the public domain, (b) becomes publicly known through no fault of the receiving party, or (c) is otherwise known by the receiving party before obtaining access to it under this Contract or properly received from a third party without an obligation of confidentiality.

## 11. Intellectual Property

(a) **Work Product.** During the course of performing the Services, the Developer and their directors, officers, employees, or other representatives may, independently or in conjunction with Client, develop information, produce work product, or achieve other results for Client in connection with the Services it performs for Client.

(b) **Ownership.** The Developer agrees that such information, work product, and other results, systems and information developed by the Developer and/or Client in connection with such Services (hereinafter referred to collectively as the "Work Product") shall, to the extent permitted by law, be a "work made for hire" within the definition of Section 101 of the Copyright Act (17 U.S.C. 101), and shall remain the sole and exclusive property of Client.

(c) **Assignment of Interest.** To the extent any Work Product is not deemed to be a work made for hire within the definition of the Copyright Act, the Developer with effect from creation of any and all Work Product, hereby assigns, and agrees to assign, to Client all right, title and interest in and to such Work Product, including but not limited to copyright, all rights subsumed thereunder, and all other intellectual property rights, including all extensions and renewals thereof.

(d) **Moral Rights.** The Developer also agrees to waive any and all moral rights relating to the Work Product, including but not limited to, any and all rights of identification of authorship and any and all rights of approval, restriction or limitation on use, and subsequent modifications.

(e) **Assistance.** The Developer further agrees to provide all assistance reasonably requested by Client, both during and subsequent to the Term of this Contract, in the establishment, preservation and enforcement of Client's rights in the Work Product.

(f) **Return of Property.** Upon the termination of this Contract, the Developer agrees to deliver promptly to Client all printed, electronic, audio-visual, and other tangible manifestations of the Work Product, including all originals and copies thereof.

## 12. Non-Solicitation

(a) During the term of this Contract, and for a period of 1 year after its expiration, Client shall not solicit any of the Developer's employees or Design Agents (collectively, "Developer Employee") without the prior written consent of the Developer. "Solicit" is defined to include: solicit, recruit, engage, or otherwise employ or retain, on a full-time, part-time, consulting, work-for-hire, or any other basis.

(b) During the term of this Contract, and for a period of 1 year after its expiration, the Developer shall not solicit any of Client's employees or customers without the prior written consent of the Client. "Solicit" is defined to include: solicit, recruit, engage, or otherwise employ or retain, on a full-time, part-time, consulting, work-for-hire, or any other basis.

(c) **Agency Commission.** In the event of such Solicitation, Client shall pay the Developer an agency commission of 25% of the Developer Employee's starting salary with Client, or if hired as a contractor, 25% of the total contract fees paid to Developer Employee during the first year following the Solicitation.

## 13. Term
This Contract shall commence on the date and year first above written and shall continue for a period of 1 year unless earlier terminated in accordance with this Contract.

## 14. Termination

(a) **Discretionary Termination, Upon Notice.** Either party may terminate this contract in its business discretion upon sufficient advance notice. The amount of notice required is 1/4 of the estimated project duration. For example, if the Statement of Work estimates the services will take 80 days from kick-off to final delivery, advance notice of at least 20 days will be sufficient for discretionary termination.

(b) **Discretionary Termination by Client.** IF: Client uses this discretionary termination provision, THEN: The Developer will retain all payments already made as of the notification date, and Client shall pay the Developer (a) for all expenses incurred as of the date of notification of termination, (b) an early termination fee equal to 25% of the total project fee, and (c) No IP rights will be transferred.

(c) **Discretionary Termination by Developer.** IF: The Developer uses this discretionary termination provision, THEN: (a) The Developer will retain (or, if not paid in advance, will be due) all costs already incurred and a prorated portion of the fees for services performed up to the termination date, (b) The Developer will assist Client in transferring the project to a new developer, and (c) The Developer will assign sufficient IP rights to Client to allow Client to continue the project.

(d) **Termination for Bankruptcy.** Subject to any restrictions imposed by law, either party may immediately terminate this Contract, if the other party either: (1) ceases to do business in the normal course; (2) becomes insolvent; (3) admits in writing its inability to meet its debts or other obligations as they become due; (4) makes a general assignment for the benefit of creditors; (5) has a receiver appointed for its business or assets; (6) files a voluntary petition for protection under the bankruptcy laws; (7) becomes the subject of an involuntary petition under the bankruptcy laws that is not dismissed within 60 days.

(e) **Termination for Breach.** If a material breach of this Contract is not cured within 10 business days after a party's receiving notice of the breach, then the non-breaching party may terminate this Contract immediately upon notice.

(f) **Termination Procedure.** Upon expiration or termination of this Contract: (a) each party shall return (or, at the disclosing party's request, destroy) the Confidential Information of the other party, and (b) other than as expressly provided in this Contract, all rights and obligations of each party under this Contract, exclusive of the Services, shall survive.

## 15. Limitation of Liability
The services and the work product of the Developer are sold "as is." In all circumstances, the Developer's maximum liability to Client for damages for any and all causes whatsoever, and Client's maximum remedy, regardless of the form of action, whether in contract, tort or otherwise, shall be limited to the Developer's net profit.

In no event shall the Developer be liable for any lost data or content, lost profits, business interruption or for any indirect, incidental, special, consequential, exemplary or punitive damages arising out of or relating to the materials or the services provided by the Developer, even if the Developer has been advised of the possibility of such damages.

## 16. Limited Warranty
Except for the express representations and warranties stated in this contract, the Developer makes no warranties whatsoever. The Developer explicitly disclaims any other warranties of any kind, either express or implied, including but not limited to warranties of merchantability or fitness for a particular purpose or compliance with laws or government rules or regulations applicable to the project.

## 17. Force Majeure
Either party may invoke Force Majeure to excuse the failure of its timely performance, if such failure was caused by: fire; flood; hurricane, tornado, or other severe storm; earthquake; act of war; sabotage; terrorism; riot; interruption or failure of electrical or telecommunications service (for example, Internet failures); or failure of suppliers, subcontractors, and carriers to substantially meet their performance obligations.

Failure to make a payment may only be considered a Force Majeure event if caused by an interruption in a third-party payment system that otherwise qualifies as a force-majeure event.

A party invoking force majeure to excuse its failure of timely performance must show that the force-majeure event(s) and their relevant effects (i) were beyond the invoking party's reasonable control and (ii) could not have been avoided through the exercise of due care by the invoking party.

## 18. Indemnification

(a) **Indemnification by Developer.** The Developer agrees to indemnify and hold harmless Client and its officers, directors, employees and agents, from and against all claims, liabilities, losses, costs, damages, judgments, penalties, fines, attorneys' fees, court costs and other legal expenses, insurance deductibles and all other expenses arising out of or relating to, directly or indirectly, from:
   
   (i) the negligent, grossly negligent, or intentional act or omission of the Developer or their directors, officers, employees, agents or Developers,
   
   (ii) the Developer's failure to perform any of their obligations under this Contract, and
   
   (iii) any act or omission of the Developer in connection with the Work.

(b) **Notification.** Client will promptly notify the Developer of any claim for indemnification.

(c) **Survival.** The Developer's obligations under this Section shall survive termination or expiration of this Contract.

## 19. General Provisions

(a) **Entire Contract.** This Contract constitutes the entire contract between the parties, and supersedes all prior contracts, representations and understandings of the parties, written or oral.

(b) **Counterparts.** This Contract may be executed in counterparts, each of which shall be deemed to be an original, but all of which, taken together, shall constitute one and the same contract.

(c) **Amendment.** This Contract may be amended only by written contract of the parties.

(d) **Notices.** All notices shall be sent by email. Permissible addresses for notice include those stated in this Contract and any other address reasonably communicated.

A notice that is sent by email but is not read by the addressee is nevertheless effective if, but only if, it has been (a) sent from an email account that has been designated for notice and (b) delivered to an email account that has been designated for notice. Email accounts designated for notice are identified at the bottom of this Contract, and may be amended email or written notice.

(e) **Assignment.** This Contract shall not be assigned by either party without the consent of the other party.

(f) **Governing Law.** This Contract shall be governed by and construed in accordance with the laws of the State of [JURISDICTION STATE], without regard to its conflict of laws rules.

(g) **No Waiver of Rights.** A failure or delay in exercising any right, power or privilege in respect of this Contract will not be presumed to operate as a waiver, and a single or partial exercise of any right, power or privilege will not be presumed to preclude any subsequent or further exercise, of that right, power or privilege or the exercise of any other right, power or privilege.

---

**IN WITNESS WHEREOF**, the Client and the Developer have each executed and delivered this Contract as of {{currentDate}}.

**Signature Page**

<table style="width:100%; border-collapse: collapse;">
  <tr>
    <td style="border: 1px solid black; padding: 10px;"><strong>Developer name</strong>:</td>
    <td style="border: 1px solid black; padding: 10px;"><strong>Client Contact name</strong>:</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; height: 50px;">[DEVELOPER NAME]</td>
    <td style="border: 1px solid black; height: 50px;">{{fullName}}</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;"><strong>Developer email for Notice</strong>:</td>
    <td style="border: 1px solid black; padding: 10px;"><strong>Client email for Notice</strong>:</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; height: 50px;">[DEVELOPER EMAIL]</td>
    <td style="border: 1px solid black; height: 50px;">{{businessEmail}}</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;"><strong>Developer signature</strong>:</td>
    <td style="border: 1px solid black; padding: 10px;"><strong>Client Contact signature</strong>:</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; height: 75px;"></td>
    <td style="border: 1px solid black; height: 75px;"></td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;"><strong>Date signed</strong>:</td>
    <td style="border: 1px solid black; padding: 10px;"><strong>Date signed</strong>:</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; height: 50px;"></td>
    <td style="border: 1px solid black; height: 50px;"></td>
  </tr>
</table>
  
  
  
  
  
  
  
  
  
`,
    category: "contract",
    isTemplate: true,
    variables: [
      "businessName",
      "currentDate",
      "billingAddress",
      "estimatedBudget",
      "currentDate",
      "businessEmail",
      "fullName",
    ],
  },
  {
    title: "California Contract Killer",
    description:
      "A plain language web development contract courtesy of: https://github.com/mapache-salvaje/contract-killer",
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
Signed by {{fullName}}, {{currentDate}}  
  
  
  
  
  
  
  
  
  `,
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
  
  **Prepared by:** [Developer]
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
    content: `# Invoice

**Date: {{currentDate}}**  
**Invoice No. _______**

---

## BILL TO:

{{businessName}} 

### Contact

{{fullName}}
{{phone}}  
{{email}}

| DESCRIPTION | PRICE | SUBTOTAL |
|-------------|-------|----------|
|{{serviceDesired}} | | |
| | | |
| | | |
| | | |

| SUBTOTAL | TAX (%) | TOTAL AMOUNT |
|----------|-----------|--------------|
| {{billedAmount}} | _______ | **_______** |

---

### Payment Summary

**Total Amount: $_______**  
**Amount Paid: {{paidAmount}}**  
**Remaining Balance: {{remainingBalance}}**

---

### Contact Information

[Your Company Name]  
[Your Company Email]  
[Your Company Phone] 
[Your Company Mailing Address]

---  
  
  
  
  
  
  
  
  
  
  `,
    category: "invoice",
    isTemplate: true,
    variables: [
      "businessName",
      "businessEmail",
      "businessPhone",
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
  
  ## Between [Developer] and {{businessName}}
  
  **Date:** {{currentDate}}
  
  This Website Maintenance Agreement is made between [Developer] ("Developer") and {{businessName}} ("Client").
  
  ### 1. Services
  
  Provider agrees to perform the following website maintenance services:
  
  - Regular website updates and content changes
  - Security monitoring and updates
  - Search engine optimization
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
  {{fullName}}, {{businessName}}, Client
  
  ________________________
  [Developer]
  
    
    
    
    
    
    
    
    
    
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
  title: "Markdown & Variables Guide for Forms",
  description: "Learn how to create and edit your own custom forms with markdown and variables",
  content: `# 📝 Form Template Guide

## Welcome to the Form Builder!

> This template is designed to help you learn how to create and customize your own forms. Feel free to edit this template or use it as a reference when creating new forms.  
> Click the "Edit" button in the form preview screen to start customizing.
> **Note:** This template uses variables to automatically fill in client data. Make sure to replace the placeholders with actual data when using the template.


**Examples:**

Current date: {{currentDate}}

Hello {{fullName}}, welcome to your guide on creating custom forms for {{businessName}}!

---

## 🔄 Using Variables

Variables allow you to automatically insert client data into your forms. Here are some common variables you can use:

### Client Personal Info
- **{{firstName}}** - Client's first name
- **{{lastName}}** - Client's last name
- **{{fullName}}** - Client's full name
- **{{email}}** - Client's personal email
- **{{phone}}** - Client's phone number

### Business Info
- **{{businessName}}** - Business name
- **{{businessEmail}}** - Business email
- **{{businessPhone}}** - Business phone
- **{{billingAddress}}** - Complete billing address

### Project Info
- **{{serviceDesired}}** - Requested service
- **{{estimatedBudget}}** - Client's estimated budget
- **{{billedAmount}}** - Amount billed to client
- **{{paidAmount}}** - Amount client has paid
- **{{remainingBalance}}** - Remaining balance to be paid

### Dates
- **{{currentDate}}** - Current date when form is generated
- **{{createdAt}}** - Date the client was created in system

---

## 📝 Markdown Formatting Guide

### Basic Text Formatting

This is **bold text** and this is *italic text*.
You can also use __bold__ and _italic_ with underscores.
To ~~strikethrough~~ text, use tildes.

### Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4

### Lists

Unordered lists:
* Item 1
* Item 2
  * Nested item
  * Another nested item
* Item 3

Ordered lists:
1. First item
2. Second item
3. Third item

### Links

[Visit Markdown Guide](https://www.markdownguide.org)

### Images

![Alt text for an image](https://images.pexels.com/photos/7927357/pexels-photo-7927357.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)

### Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> And even multiple paragraphs.

### Code

Inline \`code\` can be included with backticks.

For code blocks, use triple backticks:

\`\`\`
function exampleCode() {
  return "Hello world!";
}
\`\`\`

### Tables

| Name | Email | Phone |
|------|-------|-------|
| {{firstName}} | {{email}} | {{phone}} |
| Contact 2 | email2@example.com | 555-5678 |

### Horizontal Rule

Use three hyphens, asterisks, or underscores to create a horizontal rule:

---

## 🌐 HTML in Markdown

You can also use HTML for more advanced formatting:

<div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
  <h3 style="color: #4361ee;">Custom Styled Box</h3>
  <p>This box uses HTML and inline CSS for custom styling.</p>
</div>

<table style="width:100%; border-collapse: collapse;">
  <tr style="background-color: #4361ee; color: white;">
    <th style="border: 1px solid black; padding: 10px;">Header 1</th>
    <th style="border: 1px solid black; padding: 10px;">Header 2</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;">Cell 1</td>
    <td style="border: 1px solid black; padding: 10px;">Cell 2</td>
  </tr>
</table>

## 📊 Adding a Signature Box

<table style="width:100%; border-collapse: collapse; margin-top: 20px;">
  <tr>
    <td style="border: 1px solid black; padding: 10px; width: 50%;">
      <strong>Client Signature</strong><br><br><br>
      ____________________________<br>
      {{fullName}}<br>
      {{businessName}}
    </td>
    <td style="border: 1px solid black; padding: 10px; width: 50%;">
      <strong>Provider Signature</strong><br><br><br>
      ____________________________<br>
      Your Name<br>
      Your Business
    </td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;">
      <strong>Date:</strong> _________________
    </td>
    <td style="border: 1px solid black; padding: 10px;">
      <strong>Date:</strong> _________________
    </td>
  </tr>
</table>

---

## 📚 Additional Resources

* [Markdown Guide](https://www.markdownguide.org) - Comprehensive markdown reference
* [GitHub Markdown](https://guides.github.com/features/mastering-markdown/) - GitHub's markdown guide
* [HTML in Markdown](https://www.markdownguide.org/basic-syntax/#html) - Using HTML within markdown

---

**Remember:** When creating templates, focus on clear organization, professional language, and consistency in formatting. You can edit this template by clicking the "Edit" button in the form preview screen.

Give it a try!  
  
  
  
  
  
  
  
  
  
  `,
  category: "other",
  isTemplate: true,
  variables: [
    "firstName",
    "lastName",
    "fullName",
    "email",
    "phone",
    "businessName",
    "businessEmail",
    "businessPhone",
    "billingAddress",
    "preferredContact",
    "serviceDesired",
    "estimatedBudget",
    "billedAmount",
    "paidAmount",
    "remainingBalance",
    "currentDate",
    "createdAt"
  ],
}
];

module.exports = formSeeds;