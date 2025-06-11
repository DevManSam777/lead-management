# Form Seeds Documentation

## Overview

The `formSeeds.js` file contains an array of form templates for generating business documents like contracts, proposals, invoices, and agreements to get you started. Each template uses variable substitution and markdown formatting.  Within the DevLeads application, you can also create new forms, edit existing forms, and/or delete forms.

## Template Structure

Each template object requires these properties:

```javascript
{
  title: "Template Name",
  description: "Brief description",
  content: `Markdown content with {{variables}}`,
  category: "contract|proposal|invoice|agreement|other",
  isTemplate: true,
  variables: ["array", "of", "variables"]
}
```

## Available Variables

Based on the templates in the file, these variables are available:

### Personal Information
- `firstName` - Client's first name
- `lastName` - Client's last name
- `fullName` - Client's full name
- `email` - Client's email address
- `phone` - Client's phone number

### Business Information
- `businessName` - Business/company name
- `businessEmail` - Business email address
- `businessPhone` - Business phone number
- `billingAddress` - Complete billing address

### Communication
- `preferredContact` - Preferred contact method

### Project Information
- `serviceDesired` - Requested service description
- `estimatedBudget` - Client's estimated budget

### Financial Information
- `billedAmount` - Amount billed to client
- `paidAmount` - Amount client has paid
- `remainingBalance` - Outstanding balance

### Dates
- `currentDate` - Current date when form is generated
- `createdAt` - Date the client record was created

## Categories

Templates are organized into five categories:

- **contract** - Legal agreements and contracts
- **proposal** - Project proposals and quotes
- **invoice** - Billing and payment documents
- **agreement** - Service agreements and terms
- **other** - Reference materials and guides

## Adding New Templates

Add a new object to the `formSeeds` array:

```javascript
{
  title: "New Template",
  description: "Description of the template",
  content: `# Template Title

Hello {{fullName}},

Your project: {{serviceDesired}}
Budget: {{estimatedBudget}}
Date: {{currentDate}}
`,
  category: "proposal",
  isTemplate: true,
  variables: [
    "fullName",
    "serviceDesired", 
    "estimatedBudget",
    "currentDate"
  ]
}
```

## Variable Usage

### Basic Usage
Wrap variable names in double curly braces:

```markdown
Dear {{fullName}},

Thank you for choosing {{businessName}} for {{serviceDesired}}.
```

### In Tables
```markdown
| Service | Amount |
|---------|--------|
| {{serviceDesired}} | {{billedAmount}} |
| Amount Paid | {{paidAmount}} |
| Balance Due | {{remainingBalance}} |
```

### Important Rules
- Use double curly braces: `{{variableName}}`
- Variable names are case-sensitive
- List all variables in the `variables` array
- Check spelling carefully

## Markdown Support

### Text Formatting
```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
```

### Headers
```markdown
# Main Title
## Section Header
### Subsection
```

### Lists
```markdown
- Bullet point
- Another point

1. Numbered item
2. Second item
```

### Tables
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### Links
```markdown
[Link text](https://example.com)
```

## HTML Support

You can use HTML for advanced formatting:

```html
<table style="width:100%; border-collapse: collapse;">
  <tr>
    <td style="border: 1px solid black; padding: 10px;">
      <strong>Client:</strong> {{fullName}}<br>
      <strong>Date:</strong> {{currentDate}}
    </td>
  </tr>
</table>
```

## Best Practices

### Template Design
- Use clear, professional language
- Organize with logical headers
- Include signature areas where needed
- Add contact information sections

### Variable Management
- Use descriptive variable names
- Include all variables in the variables array
- Test variable substitution
- Be consistent across templates

## Troubleshooting

### Variables Not Replacing
- Check spelling in both content and variables array
- Ensure double curly braces: `{{variable}}`
- Verify variable is listed in variables array

### Template Not Appearing
- Confirm `isTemplate: true` is set
- Check all required properties are present
- Verify template is in the formSeeds array

### Formatting Issues
- Check markdown syntax
- Validate HTML if used
- Test table formatting

## Example Usage

### Simple Agreement Section
```markdown
## Project Details

Client: {{businessName}}
Contact: {{fullName}}
Service: {{serviceDesired}}
Budget: {{estimatedBudget}}
Date: {{currentDate}}
```

### Invoice Summary
```markdown
| Description | Amount |
|-------------|--------|
| {{serviceDesired}} | {{billedAmount}} |
| Amount Paid | {{paidAmount}} |
| **Balance Due** | **{{remainingBalance}}** |
```

## Running the Seeds

The project includes npm scripts to populate your database with the form templates:

### `npm run seed:force`
Forces the form seeding process to run, deleting all existing templates and populating the forms page with fresh starter templates from the `formSeeds.js` file.

**Use this when:**
- You want to completely reset all templates
- You've made changes to existing templates and want to replace them

**Warning:** This will delete all existing form templates in your database.

### `npm run seed:reset`
Inserts any starter template forms that are currently missing in the database (based on title), leaving existing forms untouched. Also resets the internal seeder status flag.

**Use this when:**
- You've added new templates to `formSeeds.js` and want to add them without affecting existing ones
- You want to restore any accidentally deleted default templates
- You need to reset the seeder status flag

**Safe option:** This preserves your existing custom templates.

## Getting Started

1. Review existing templates for examples
2. Choose appropriate category
3. Use the "Markdown & Variables Guide" template as reference
4. Test variable substitution thoroughly
5. Visit [markdown.org](markdown.org) to brush up on your markdown syntax
5. Follow markdown best practices

The file includes a comprehensive guide template that demonstrates all features and provides interactive examples.