
# **Research Best Practices for LLM-Optimized Design System Pattern Libraries**

---

---

### **File: docs/design/patterns/dashboard.md**

---

# **Dashboard**

## **Pattern Name**

Dashboard

## **When to Use**

Use for a high-level "home" screen where users consume diverse, at-a-glance information and monitor system status.1 Optimized for data visualization, key performance indicators (KPIs), and quick navigation to operational tasks.

## **Key Principles**

* **Prioritize by Hierarchy (F-Pattern):** A dashboard must establish a strong visual hierarchy. The most critical, high-level summary information must be placed in the top-left of the layout. This follows the F-shaped reading pattern common in Western cultures, guiding the user to the most important data first.1  
* **Use a Card-Based Layout:** All content modules must be segmented into Card components. Shopify Polaris mandates that "The majority of your app's content should live in a container, such as a card".2 This approach creates a clear visual structure, improves scannability, and ensures the layout is inherently modular and responsive.  
* **Structure with Canonical Panes:** For complex dashboards, especially on larger screens, the layout should be built from a "canonical layout".3 On compact screens, this will be a single, scrollable pane.2 On larger screens, this can expand to a two-pane "Fixed and flexible layout," such as a fixed navigation or filter list pane next to a flexible grid of Card components.4  
* **Distinguish Presentation from Exploration:** The default dashboard view should be a "Presentation Dashboard" focused on at-a-glance monitoring. This requires limiting the number of metrics to reduce cognitive load.1 Interactive features for "Exploration Dashboards" (e.g., complex filtering, drill-downs, roll-ups) should be available but presented as a secondary action, such as a "View Report" link.1  
* **Maintain Grid and Spacing Consistency:** A consistent grid (e.g., a 4px-based spacing grid as used by Shopify 2) and layout system is essential. All charts should use the same layout and spacing to create a cohesive and harmonious experience.1

## **Structure**

The default dashboard structure is a Page or main element containing a Grid layout.

* The Grid component manages the responsive layout of the dashboard modules.  
* Each module is contained within a Card component.  
* Each Card must have a CardHeader (with a Title and descriptive Text) and CardContent (containing a Chart, Table, Metric, or List).  
* A common layout might use a 2- or 3-column grid, with a primary Card spanning multiple columns at the top to emphasize the most important KPI.1

## **Code Example**

This example uses **Tremor** components, as they are specifically designed for building dashboards.5 The code demonstrates a responsive Grid with Card and Metric components to display primary KPIs, and an AreaChart for visualization.6

TypeScript

import {
  Grid,
  Col,
  Card,
  Metric,
  Text,
  AreaChart,
  Title
} from "@tremor/react";

const chartdata \=;

export default function DashboardExample() {  
  return (  
    \<main className="p-4 md:p-10"\>  
      \<Title\>Dashboard\</Title\>  

      \<Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6"\>  
        \<Col numColSpanMd={2} numColSpanLg={3}\>  
          \<Card\>  
            \<Text\>Total Revenue (YTD)\</Text\>  
            \<Metric\>$1,250,000.00\</Metric\>  
            \<AreaChart  
              className="h-72 mt-4"  
              data={chartdata}  
              index="date"  
              categories={}  
              colors={\["blue"\]}  
              yAxisWidth={60}  
              showAnimation={true}  
            /\>  
          \</Card\>  
        \</Col\>  
          
        \<Card\>  
          \<Text\>New Customers\</Text\>  
          \<Metric\>1,234\</Metric\>  
        \</Card\>  
          
        \<Card\>  
          \<Text\>Active Accounts\</Text\>  
          \<Metric\>45,678\</Metric\>  
        \</Card\>

        \<Card\>  
          \<Text\>Conversion Rate\</Text\>  
          \<Metric\>4.5%\</Metric\>  
        \</Card\>  
      \</Grid\>  
    \</main\>  
  );  
}

## **UX Writing**

* **Card Titles:** Use clear, descriptive nouns (e.g., "Total Revenue," "Active Subscriptions," "Open Tasks").  
* **Metric Descriptions:** Provide context for the metric in a small Text component (e.g., "+12.5% from last month" or "Updated 5 mins ago").  
* **Chart Labels:** Ensure all chart axes and legends are clearly and concisely labeled.  
* **Empty States:** When a chart or card has no data, it must display an empty state. Provide a clear message (e.g., "No data to display") and, if possible, a contextual action (e.g., "Connect your data source to see this chart").8

## **Accessibility**

* **Hierarchy:** The DOM order *must* match the visual F-pattern hierarchy to ensure a logical flow for screen readers.1  
* **Color Contrast:** All data visualizations (e.g., lines, bars, segments) and text must meet WCAG AA contrast ratios.9  
* **Chart Accessibility:** All interactive charts must be keyboard-navigable. Provide a non-visual, aria-label description for screen readers that summarizes the chart's data and conclusion (e.g., "Bar chart showing revenue increasing from $10k in January to $14k in May.").  
* **Landmarks:** Use \<main\> for the primary dashboard container and \<section\> or \<article\> (within cards) to define page regions.

## **Avoid**

* **Information Overload:** Do not place more than 5-7 distinct Card modules on the default view. Prioritize the most critical information.1  
* **Aesthetic-Only Charts:** Do not use charts that are purely decorative. Every visualization must communicate a key metric or trend.  
* **Mixed Primary Actions:** Avoid placing multiple, competing primary-styled buttons in different cards. A dashboard should have one, or zero, primary page-level actions.2  
* **Inconsistent Layout:** Do not mix different grid systems or spacing rules. This creates visual chaos and increases cognitive load.1

## **Related**

* **Settings Page:** For configuring which metrics or cards appear on the dashboard.  
* **UX Writing:** For authoring clear empty state and error message content.

---

---

### **File: docs/design/patterns/landing-page.md**

---

# **Landing Page (Marketing & Product)**

## **Pattern Name**

Landing Page (Marketing & Product)

## **When to Use**

To introduce a product, feature, or service and drive a single, focused conversion action. This action could be signing up, downloading a resource, purchasing a product, or booking a demonstration.10

## **Key Principles**

* **Single, Focused CTA:** The entire page must be focused on a single offer with one primary call to action (CTA). This CTA should be visible above the fold and repeated in other relevant sections.10  
* **Clear Value Proposition:** Use a clear and concise value statement "above the fold" so visitors immediately understand the page's purpose and the benefit they will receive.10  
* **Scannable Content:** Optimize for scannability. Limit paragraphs to a maximum of 3 lines. Use clear headings, subheadings, and bullet points to break up text and guide the user.11  
* **Build Trust with Social Proof:** Include testimonials, customer logos, case studies, or statistics to back up claims and build trust with the visitor.10  
* **Conversion-Centered Layout:** Use whitespace, color, and contrast to make the primary CTA button visually distinct and the focal point of the page.10  
* **Support Copy with Visuals:** Use illustrations, product screenshots, or motion graphics to support the key message. Visuals should be "almost always used to support copy, and should never distract or overshadow the key message".12

## **Structure**

A landing page is a persuasive argument, and its structure must follow a logical flow. A typical structure includes these sections in order 13:

* \<header\>: A minimal navigation bar, often containing only the product logo and a single, secondary-style CTA.  
* \<main\>  
  * \<section id="hero"\>: The "hook." Contains the main heading (Value Proposition), subheading, and the primary CTA button.14  
  * \<section id="social-proof"\>: The "trust." A section displaying logos of well-known customers or sponsors.  
  * \<section id="features"\>: The "logic." A 3-column grid of key features, each with an icon, a feature name, and a short description.  
  * \<section id="testimonials"\>: The "emotional proof." A Card-based layout for 2-3 compelling customer quotes.  
  * \<section id="pricing"\>: (Optional) A pricing table to handle objections.  
  * \<section id="faq"\>: (Optional) An accordion-based section to handle common objections or questions.  
  * \<section id="final-cta"\>: The "close." A final, prominent section that repeats the value proposition and the primary CTA button.  
* \<footer\>: A full sitemap with navigation, legal links, and social media links.

## **Code Example**

This example uses **shadcn/ui** components to build the hero section of a landing page.15 It demonstrates a responsive two-column layout, clear typography, and a primary CTA.

TypeScript

import { Button } from "@/components/ui/button";

export default function LandingPageHero() {  
  return (  
    \<section className="container mx-auto px-4 py-20 md:py-32"\>  
      \<div className="grid lg:grid-cols-2 lg:items-center gap-10"\>  

        {/\* Left Column: Text Content \*/}  
        \<div className="text-center lg:text-start space-y-6"\>  
          \<main\>  
            \<h1 className="text-5xl md:text-6xl font-bold"\>  
              Build your next application  
              \<span className="text-primary"\> faster than ever.\</span\>  
            \</h1\>  
          \</main\>

          \<p className="text-lg md:text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0"\>  
            A generative UI system that builds itself. Powered by the  
            world's best design practices, optimized for LLMs, and ready   
            to deploy in minutes.  
          \</p\>

          \<div className="space-x-4"\>  
            \<Button size="lg" className="px-8 py-6 text-lg"\>  
              Get Started Free  
            \</Button\>  
            \<Button variant="outline" size="lg" className="px-8 py-6 text-lg"\>  
              View Documentation  
            \</Button\>  
          \</div\>  
        \</div\>  
          
        {/\* Right Column: Visual Placeholder \*/}  
        \<div className="lg:col-start-2 order-first lg:order-last"\>  
          \<div className="bg-muted/50 aspect-video rounded-xl shadow-lg"   
               aria-label="Placeholder graphic for product" /\>  
        \</div\>

      \</div\>  
    \</section\>  
  );  
}

## **UX Writing**

* **Headlines:** Use active voice. Focus on the *benefit* to the user, not the *feature* of the product. (e.g., "Get more done," not "Our fast-processing engine").17  
* **CTAs:** Use strong, clear, action-oriented verbs. (e.g., "Start free trial," "Get started today," "View plans"). Avoid vague "Submit" or "Click here".18  
* **Tone:** The tone should be conversational, optimistic, and practical.18 It should be "clear but not cold" and "conversational but not jargon-y".18  
* **Headings:** Use sentence case for headings and titles. This is more approachable and readable.17

## **Accessibility**

* **Heading Structure:** The page *must* follow a logical \<h1\>, \<h2\>, \<h3\> hierarchy. The main value proposition in the hero is the *only* \<h1\>.  
* **Link Text:** All links and CTAs must be descriptive. "Click here" is an accessibility failure.18  
* **Keyboard Navigation:** Ensure all CTAs and links are keyboard-focusable and have a visible focus state.  
* **Alt Text:** All illustrative images must have alt text that describes their purpose in supporting the copy.12 Decorative graphics should use alt="".

## **Avoid**

* **Multiple Competing CTAs:** Do not have two *different* primary offers (e.g., "Start Trial" and "Book Demo" as two primary buttons). This splits focus and hurts conversion.  
* **Text-Heavy Layouts:** Avoid "stuffing the header" with too many links or creating long, unbroken walls of text. Keep it scannable.11  
* **Jargon:** Avoid internal or overly technical terminology that the target audience may not understand.18  
* **Distracting Visuals:** Do not use illustrations or animations that overshadow the key message or the primary CTA.12

## **Related**

* **Authentication Flows:** The page's primary CTA (e.g., "Get Started Free") often leads to the auth-flows.md sign-up pattern.  
* **UX Writing:** For defining the voice, tone, and specific microcopy.

---

---

### **File: docs/design/patterns/settings-page.md**

---

# **Settings Page**

## **Pattern Name**

Settings Page

## **When to Use**

To allow users to view and modify application preferences, user profile details, or system configurations. This pattern is a crucial part of any application that requires user-level configuration.

## **Key Principles**

* **Group Logically:** The most important principle of settings is to group related tasks and inputs. Section titles must be used to provide context and make the interface easier to scan and understand.20  
* **Use a List-Detail Layout (Desktop):** For most applications, a two-pane "Split page" layout is the canonical pattern for settings on larger viewports.21 This layout uses a fixed-width left pane (the "list") for navigation and a flexible right pane (the "detail") to display the form controls for the selected section. Material 3 refers to this as a "Fixed and flexible layout".4  
* **Be Responsive (Drill-Down):** On narrow viewports (e.g., mobile), the pattern must adapt. The two-pane layout collapses. The user is first presented with the "list" (navigation) as a full page. Selecting an item "drills-in" to the "detail" (form) as a new page, with a "Back" button in the header to return to the list.21  
* **Use "Annotated" Layouts for Complex Sections:** For settings that are complex, high-stakes, or require explanation (e.g., API keys, Billing, Security), the "detail" pane itself should use an "annotated" layout. This sub-pattern uses a primary column for the form controls and a secondary, narrower column for descriptive text that explains *why* each setting is needed.22  
* **Progressively Disclose Complexity:** Only show settings that are relevant. Hide advanced or rarely used configurations behind a "Disclosure" toggle or an "Advanced settings" link. This respects the user's attention and reduces cognitive load.20  
* **Never Disable the Save Button:** The primary "Save" button should *never* be disabled, even if the form is in an invalid state. A disabled button provides no feedback. Instead, allow the user to click "Save" and use validation and error messages to describe what needs to be fixed.24

## **Structure**

The structure of a settings page is a composite of three hierarchical layout patterns:

1. **Top-Level (Page):** A "Split Page" (List-Detail) layout.4  
   * **Left Pane (Navigation):** A vertical NavList (per Primer 21) or NavigationMenu with links to sections (e.g., "Profile," "Notifications," "Billing," "Security").  
   * **Right Pane (Content):** A Form 20 containing the settings for the active navigation item.  
2. **Alternative (Simple Settings):** For applications with only 2-3 settings categories, a Tabs component can be used at the top of the page instead of a sidebar.25  
3. **Content-Level (Section):** The right pane itself can be structured as an "Annotated" layout, with a main content column and a description/helper text column.23

## **Code Example**

This example uses **shadcn/ui** and demonstrates the simpler **Tabs** variant for a settings page.25 This is suitable for user profile or account settings with low complexity.

TypeScript

import { Button } from "@/components/ui/button";  
import {  
  Card,  
  CardContent,  
  CardDescription,  
  CardFooter,  
  CardHeader,  
  CardTitle,  
} from "@/components/ui/card";  
import { Input } from "@/components/ui/input";  
import { Label } from "@/components/ui/label";  
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";  
import { Checkbox } from "@/components/ui/checkbox";

export default function SettingsTabsExample() {  
  return (  
    \<div className="p-4 md:p-10"\>  
      \<h1 className="text-3xl font-bold mb-6"\>Settings\</h1\>  

      \<Tabs defaultValue="profile" className="w-full max-w-2xl"\>  
        \<TabsList className="grid w-full grid-cols-3"\>  
          \<TabsTrigger value="profile"\>Profile\</TabsTrigger\>  
          \<TabsTrigger value="notifications"\>Notifications\</TabsTrigger\>  
          \<TabsTrigger value="billing"\>Billing\</TabsTrigger\>  
        \</TabsList\>  
          
        \<TabsContent value="profile"\>  
          \<Card\>  
            \<CardHeader\>  
              \<CardTitle\>Profile\</CardTitle\>  
              \<CardDescription\>  
                Make changes to your public profile here. Click save when you're done.  
              \</CardDescription\>  
            \</CardHeader\>  
            \<CardContent className="space-y-4"\>  
              \<div className="space-y-2"\>  
                \<Label htmlFor="name"\>Name\</Label\>  
                \<Input id="name" defaultValue="Claude" /\>  
              \</div\>  
              \<div className="space-y-2"\>  
                \<Label htmlFor="username"\>Username\</Label\>  
                \<Input id="username" defaultValue="@claude" /\>  
              \</div\>  
            \</CardContent\>  
            \<CardFooter\>  
              \<Button\>Save changes\</Button\>  
            \</CardFooter\>  
          \</Card\>  
        \</TabsContent\>  
          
        \<TabsContent value="notifications"\>  
          \<Card\>  
            \<CardHeader\>  
              \<CardTitle\>Notifications\</CardTitle\>  
              \<CardDescription\>  
                Manage how you receive notifications.  
              \</CardDescription\>  
            \</CardHeader\>  
            \<CardContent className="space-y-4"\>  
              \<div className="flex items-center space-x-2"\>  
                \<Checkbox id="email-new-comments" /\>  
                \<Label htmlFor="email-new-comments"\>Email me for new comments\</Label\>  
              \</div\>  
              \<div className="flex items-center space-x-2"\>  
                \<Checkbox id="email-marketing" /\>  
                \<Label htmlFor="email-marketing"\>Email me with marketing updates\</Label\>  
              \</div\>  
            \</CardContent\>  
            \<CardFooter\>  
              \<Button\>Save preferences\</Button\>  
            \</CardFooter\>  
          \</Card\>  
        \</TabsContent\>

        \<TabsContent value="billing"\>  
          {/\*... Billing Form Content... \*/}  
        \</TabsContent\>  
      \</Tabs\>  
    \</div\>  
  );  
}

## **UX Writing**

* **Labels:** All form inputs *must* have a visible \<Label\>. Do not use placeholder text as a label.20  
* **Helper Text:** Use descriptive text *below* an input or in the annotated "aside" 23 to explain *why* a setting is needed or what its effect is. (e.g., "This name will be public on your profile.")  
* **CTAs:** The primary action is "Save changes" or "Save preferences." A "Cancel" link button should also be provided to discard changes.24  
* **Headings:** Use clear, concise headings for each logical group of settings (e.g., "Notification settings," "Password settings").20

## **Accessibility**

* **Keyboard Navigation:** Users must be able to navigate the settings list (sidebar or tabs) and all form fields using only the keyboard.25  
* **aria- Attributes:** Use aria-labelledby to programmatically connect tab panels to their corresponding TabsTrigger.  
* **Focus:** The first form field in the "detail" pane should be autofocused on load to allow for immediate keyboard interaction.24  
* **Labels:** All inputs must be programmatically linked to their labels using htmlFor and id.24

## **Avoid**

* **Disabled "Save" Button:** *Never* disable the save button. This is a critical accessibility and usability anti-pattern. A disabled button gives no feedback. Always allow the submit action and present clear, inline validation errors.24  
* **Mixing Unrelated Settings:** Do not put "Billing" and "Profile" settings in the same form group. Use logical grouping to reduce cognitive load.20  
* **Jargon:** Do not use internal, technical, or ambiguous jargon for setting labels. The purpose and effect of every setting must be clear.

## **Related**

* **Authentication Flows:** For the "Change Password" or "Security" sections of the settings page.  
* **UX Writing:** For all form labels, helper text, and validation messages.

---

---

### **File: docs/design/patterns/auth-flows.md**

---

# **Authentication Flows (Sign-in, Sign-up)**

## **Pattern Name**

Authentication Flows (Sign-in, Sign-up)

## **When to Use**

To allow a user to gain access to an application (sign-in), create a new account (sign-up), or recover their credentials (reset password). This is a high-stakes, "interstitial" flow.21

## **Key Principles**

* **Use Progressive Authentication:** This is the preferred pattern. The initial screen requests *only* the User ID (e.g., email) and a "Continue" button. After the user submits their email, the system determines the next step:  
  1. If the email domain is recognized for SSO, redirect to the identity provider.  
  2. If the email is a standard, non-SSO account, show the password field.  
  3. If the email is not found, it may prompt the user to "Sign up."  
     This approach "decreases the user's cognitive load by eliminating non-essential distractions".26  
* **Use Interstitial Page Layout:** Authentication forms must be presented on a focused, "interstitial" page. This is a centered, single-column layout that limits all other navigation and distractions, focusing the user on the single task.21  
* **Clearly Link Between Flows:** Provide clear, secondary-style links for "Forgot password?" and "Create an account" (on the sign-in page) or "Already have an account? Log in" (on the sign-up page).26  
* **Handle Errors Gracefully and Securely:** On a failed login, *do not* reveal *which* field was wrong. Use a single, generic error message (e.g., "Incorrect email or password. Try again.") This prevents "user enumeration" attacks, which is a major security vulnerability.26  
* **Autofocus the First Field:** Automatically focus the first input field (Email) when the page loads. This allows immediate keyboard interaction.24

## **Structure**

The layout is an interstitial page 21, typically a Card component centered vertically and horizontally on the screen.

* **CardHeader**: Contains the title (e.g., "Log in" or "Create account") and a brief description.27  
* **CardContent**: Contains the form fields.  
  * **Progressive Flow (Preferred):**  
    * *Step 1:* One Input for "Email" and one Button for "Continue."  
    * *Step 2:* The "Email" field is replaced or shown as static text, and the "Password" Input field is displayed with the final "Log in" Button.  
  * **Traditional Flow (Fallback):** Two Input fields ("Email," "Password") and one Button ("Log in"). This is acceptable but not preferred.  
* **CardFooter**: Contains the secondary links for "Forgot Password?" and navigating between sign-up/sign-in.

## **Code Example**

This example uses **shadcn/ui** with react-hook-form and zod for validation.28 It demonstrates the preferred **Progressive Authentication** flow 26 using a simple state machine.

TypeScript

"use client";

import \* as z from "zod";  
import { useForm } from "react-hook-form";  
import { zodResolver } from "@hookform/resolvers/zod";  
import { Button } from "@/components/ui/button";  
import { Input } from "@/components/ui/input";  
import { Label } from "@/components/ui/label";  
import {  
  Card,  
  CardContent,  
  CardDescription,  
  CardFooter,  
  CardHeader,  
  CardTitle,  
} from "@/components/ui/card";  
import {  
  Form,  
  FormControl,  
  FormField,  
  FormItem,  
  FormLabel,  
  FormMessage,  
} from "@/components/ui/form";  
import { useState } from "react";

// Schema for Step 1  
const emailSchema \= z.object({  
  email: z.string().email("Enter a valid email address."),  
});  
type EmailFormValues \= z.infer\<typeof emailSchema\>;

// Schema for Step 2  
const passwordSchema \= z.object({  
  password: z.string().min(1, "Password is required."),  
});  
type PasswordFormValues \= z.infer\<typeof passwordSchema\>;

export default function ProgressiveLoginForm() {  
  const \= useState(1);  
  const \[userEmail, setUserEmail\] \= useState("");  
  const \= useState\<string | null\>(null);

  // Step 1: Email Form  
  const emailForm \= useForm\<EmailFormValues\>({  
    resolver: zodResolver(emailSchema),  
  });

  // Step 2: Password Form  
  const passwordForm \= useForm\<PasswordFormValues\>({  
    resolver: zodResolver(passwordSchema),  
  });

  // Check email and advance to step 2  
  const onEmailSubmit \= (data: EmailFormValues) \=\> {  
    console.log("Checking email:", data.email);  
    // TODO: Add logic here to check if email is SSO or exists  
    // if (isSSO(data.email)) { /\* redirect to SSO \*/ }  
    // if (\!userExists(data.email)) { /\* redirect to signup \*/ }

    // For this example, we just advance to step 2  
    setUserEmail(data.email);  
    setStep(2);  
    setServerError(null);  
  };

  // Final login submission  
  const onPasswordSubmit \= (data: PasswordFormValues) \=\> {  
    console.log("Logging in with:", userEmail, data.password);  
    // TODO: Handle final submission  
    // Example of a server error:  
    setServerError("Incorrect email or password. Try again.");  
  };

  return (  
    \<div className="flex items-center justify-center min-h-screen"\>  
      \<Card className="w-full max-w-sm"\>  
        \<CardHeader\>  
          \<CardTitle className="text-2xl"\>Log in\</CardTitle\>  
          \<CardDescription\>  
            {step \=== 1? "Enter your email to continue."
                       : \`Log in as ${userEmail}\`}  
          \</CardDescription\>  
        \</CardHeader\>  
        \<CardContent className="grid gap-4"\>  
          {step \=== 1 && (  
            \<Form {...emailForm}\>  
              \<form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="grid gap-4"\>  
                \<FormField  
                  control={emailForm.control}  
                  name="email"  
                  render={({ field }) \=\> (  
                    \<FormItem\>  
                      \<FormLabel\>Email\</FormLabel\>  
                      \<FormControl\>  
                        \<Input placeholder="<name@example.com>" {...field} autoFocus /\>  
                      \</FormControl\>  
                      \<FormMessage /\>  
                    \</FormItem\>  
                  )}  
                /\>  
                \<Button type="submit" className="w-full"\>Continue\</Button\>  
              \</form\>  
            \</Form\>  
          )}

          {step \=== 2 && (  
            \<Form {...passwordForm}\>  
              \<form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="grid gap-4"\>  
                \<FormField  
                  control={passwordForm.control}  
                  name="password"  
                  render={({ field }) \=\> (  
                    \<FormItem\>  
                      \<FormLabel\>Password\</FormLabel\>  
                      \<FormControl\>  
                        \<Input type="password" {...field} autoFocus /\>  
                      \</FormControl\>  
                      \<FormMessage /\>  
                      \<Button variant="link" size="sm" className="px-0"\>  
                        Forgot Password?  
                      \</Button\>  
                    \</FormItem\>  
                  )}  
                /\>  
                {serverError && (  
                  \<p className="text-sm font-medium text-destructive"\>  
                    {serverError}  
                  \</p\>  
                )}  
                \<Button type="submit" className="w-full"\>Log in\</Button\>  
              \</form\>  
            \</Form\>  
          )}  
        \</CardContent\>  
        \<CardFooter className="flex flex-col items-start gap-2"\>  
          {step \=== 1 && (  
            \<div className="text-sm text-muted-foreground"\>  
              Don't have an account?{" "}  
              \<Button variant="link" size="sm" className="px-0"\>Sign up\</Button\>  
            \</div\>  
          )}  
          {step \=== 2 && (  
            \<Button variant="link" size="sm" className="px-0" onClick={() \=\> setStep(1)}\>  
              Use a different email  
            \</Button\>  
          )}  
        \</CardFooter\>  
      \</Card\>  
    \</div\>  
  );  
}

## **UX Writing**

* **CTAs:** Use "Log in" and "Continue".30 IBM Carbon specifically prefers "Log in" (two words) over "Sign in".26  
* **Titles:** Use "Log in to \[Product name\]" or simply "Log in".30  
* **Error Messages (Client-side):** Be specific and helpful. "Email is required." "Enter a valid email address".26  
* **Error Messages (Server-side):** Be generic and secure. "Incorrect email or password. Try again".26

## **Accessibility**

* **Error Handling:** Error messages must be programmatically associated with their inputs (using aria-describedby) and announced by screen readers.31  
* **Labels:** All inputs must have visible labels. Do not rely on placeholder text, as it vanishes on input and is an accessibility failure.24  
* **Focus Management:** When the password field appears in Step 2, it *must* be autofocused.  
* **Form Validation:** Use react-hook-form and zod to ensure real-time, accessible validation.28

## **Avoid**

* **Exposing Security:** Do not write error messages like "User not found" or "Incorrect password." This is a major security vulnerability that allows attackers to enumerate valid user accounts.26  
* **Disabled Submit Buttons:** Do not disable the submit button. Show errors after submission. A disabled button is inaccessible and provides no feedback.24  
* **Clutter:** Do not include marketing content, global navigation, or other distracting links on this interstitial page.21

## **Related**

* **Settings Page:** Where a user can change their password after successfully logging in.  
* **Landing Page:** The origin of the "Sign up" flow.

---

---

### **File: docs/design/patterns/ux-writing.md**

---

# **UX Writing Framework**

This document outlines the generative principles for all UI text, including voice, tone, and microcopy. These principles are to be used by both human content designers and generative LLM agents.

## **1\. Voice and Tone Principles**

Our framework is built on a clear distinction:

* **Voice** is our personality. It is constant, consistent, and recognizable across all contexts.32  
* **Tone** is our expression. It adapts to the user's context and emotional state, changing based on the situation.32

### **Our Voice: Synthesized Principles**

Our universal voice is a synthesis of the best practices from Shopify, GitHub Primer, Atlassian, and IBM. It is:

* **Clear & Simple:** We use plain language.32 We write for a 7th-grade reading level to ensure comprehension for a global audience with varying literacy levels.18 We are "clear but not cold".18 We are "simple and logical".33  
* **Helpful & Guiding:** We "guide, don't prescribe," keeping the user in control.32 We are "helpful but not overly-prescriptive".18 We focus on explaining the consequences of actions so users can make informed decisions.36  
* **Human & Conversational:** We are "conversational but not jargon-y".18 We write like a "smart friend" — relatable, helpful, and engaging.37 We use "you" and "your" to address the user directly, making the UI feel like it's talking *to* them.38  
* **Action-Oriented:** We use active voice and start all calls to action (CTAs) with strong verbs.32 We "empower to inspire action".19

The core function of this voice is to **reduce cognitive load and build trust through clarity**.

### **Adaptive Tone: A Contextual Model**

An LLM must adapt its tone based on the user's likely emotional state and context. This model operationalizes the principles from Shopify 39, IBM 33, and Atlassian 19 into a clear, rule-based system.

| User Context | User Emotion (Likely) | Tone to Apply | Key Principles and Examples (from Sources) |
| :---- | :---- | :---- | :---- |
| **First Use / Onboarding** | Neutral, Curious | **Friendly & Encouraging** | Use full sentences and friendly explanations. Be welcoming. "Motivate by showing possibilities".19 (e.g., "Welcome\! Let's create your first project.") |
| **Performing Tasks / Forms** | Neutral, Focused | **Clear & Concise** | Be "concise, but not robotic".35 Use clear labels and short, scannable instructions. "Communicate the essential details".35 (e.g., "Project name") |
| **Success / Task Complete** | Positive, Satisfied | **Confirming & Positive** | "Delight with unexpectedly pleasing experiences".19 (e.g., "Project created successfully\!" or a simple "Saved.") |
| **Error / Failed Action** | Negative, Frustrated | **Direct & Helpful** | **No humor**.18 Be "economical and direct".33 Explain *what* happened and *how* to fix it. "Focus... on communicating the consequences".36 (e.g., "This name is already taken. Please choose another.") |
| **Empty State** | Neutral, Confused | **Guiding & Actionable** | Explain *why* the state is empty and *what* to do next. "Ensure a smoothness of experience".8 (e.g., "No projects found. Create your first project to get started.") |

## **2\. Microcopy Guidelines (Content)**

### **Buttons & CTAs**

* **Start with a Verb:** All CTAs should start with a strong, descriptive verb.32 (e.g., "Create project," "Save changes," "Add item," "View settings.")  
* **Be Specific:** The text must clearly describe the action the user is taking.  
* **Avoid:** Do not use "Click here," "Submit," "OK," or "Learn more" as primary CTA text.18

### **Form Fields & Labels**

* **Labels:** All form inputs *must* have a visible label.24 Labels should be left-aligned with the field underneath 24 and use sentence case.17  
* **Helper Text:** Place descriptive text *below* the input. Use it to explain requirements, formatting, or consequences. (e.g., "This cannot be changed later.")  
* **Placeholders:** Use *only* as an example of format (e.g., "<name@example.com>"). *Never* use placeholders as a substitute for a label. Placeholders disappear and are an accessibility failure.24

### **Error & Validation Messages**

* **Style:** Be clear, concise, and direct. Explain the problem and, if possible, the solution.36  
* **Placement:** Show the message inline, below the field it relates to.24  
* **Content (Client-side):** Be specific. (e.g., "Enter a valid email address.").26  
* **Content (Server-side):** Be generic for security. (e.g., "Incorrect email or password. Try again.").26

### **Empty States**

* **Anatomy:** An empty state is not an error. It must include three components 8:  
  1. **Heading:** "No projects found."  
  2. **Body:** Explain *why* it's empty. "Your new projects will appear here once you create one."  
  3. **Action:** A primary button showing how to *fix* the state. "Create your first project."

## **3\. Localization & Inclusivity (Accessibility)**

* **Write for All Readers:** Use simple words, short sentences, and active voice. Aim for a 7th-grade reading level.18  
* **Avoid Jargon & Idioms:** Do not use culturally-specific references, slang, or phrases that do not translate literally (e.read., "a piece of cake," "keep an eye on it").18  
* **Inclusive Language:** Use respectful and inclusive language.  
  * *Examples:* Use "they" or "you" instead of "he/she." Avoid ableist language like "crazy" or "lame".40 Refer to the Atlassian 40 and IBM 33 inclusive language guides.  
* **Dates & Times:** Write dates and times in a clear, unambiguous way for global audiences. (e.g., "January 1, 2025" instead of "1/1/25").40

---

---

### **File: docs/design/governance/documentation-ia.md**

---

# **Documentation Information Architecture**

This document outlines the principles for structuring our design system documentation. The structure is optimized for human comprehension, developer velocity, and LLM ingestion. This document itself is the meta-pattern that governs all other pattern files.

## **1\. Core Principles of Documentation**

The principles from GitHub Primer's documentation are the gold standard and are adopted here 41:

* **Be Concise but Friendly:** "A large proportion of readers want to find an answer that helps them complete a task, so don't waste their time with unnecessary words." However, "That doesn't mean talking like a robot".41  
* **Be Universally Understood:** "Avoid using phrases or referencing examples that are only familiar internally at GitHub." All documentation must be understandable by new hires and the public.41  
* **Provide Production-Quality Examples:** "People copy and paste code examples as a starting point." Therefore, all code examples must promote best practices, follow our principles, and meet accessibility standards.41  
* **Balance Prose, Visuals, and Code:** A robust pattern document requires a balance of all three. The IBM Carbon model, which mandates "usage, style, code, and accessibility" guidance for every component, is a clear example of this balance.42  
* **Assume Basic Knowledge:** We "assume the reader knows basic design concepts and principles, such as the need for consistency".41 We *do not* assume they know internal terminology. We must link to authoritative sources (e.g., MDN, W3C) for core web concepts rather than explaining them ourselves.41

## **2\. Mandated 8-Part Pattern Structure**

All pattern documents (.md files) in this system *must* follow this 8-part structure. This consistency is the most critical element for successful LLM training and for creating a predictable, scannable resource for human developers.

### **1\. Pattern Name**

* **Description:** The formal name of the pattern (e.g., "Dashboard", "Settings Page").  
* **Purpose for LLM:** Provides the primary key and title for the knowledge-base entry.

### **2\. When to Use**

* **Description:** 1-2 sentences describing the *problem* this pattern solves.  
* **Purpose for LLM:** Defines the core *intent* and context. An LLM will use this to map a user prompt (e.g., "I need a page for user preferences") to the correct pattern ("Settings Page").

### **3\. Key Principles**

* **Description:** 3-5 bullet points outlining the core *rules* and generative logic.  
* **Purpose for LLM:** This is the most critical section. It provides the non-negotiable rules and logical constraints for generating the pattern (e.g., "Use a List-Detail Layout," "Never Disable the Save Button").

### **4\. Structure**

* **Description:** A simple, high-level skeleton of the layout and component relationships (e.g., "A 2-pane layout with a NavList in the left pane...").  
* **Purpose for LLM:** Defines the high-level information architecture and the parent-child relationships of the components to be generated.

### **5\. Code Example**

* **Description:** A production-ready, copy-pasteable React/TSX snippet using shadcn/ui or Tremor.  
* **Purpose for LLM:** Provides the concrete implementation, syntax, and component APIs. This is the primary *output* example.

### **6\. UX Writing**

* **Description:** Specific microcopy examples for labels, errors, empty states, and CTAs.  
* **Purpose for LLM:** Provides the *content* to populate the generated structure, ensuring the copy aligns with the system's voice and tone.

### **7\. Accessibility**

* **Description:** The essential WCAG requirements for the pattern.  
* **Purpose for LLM:** Defines the non-negotiable accessibility rules, such as aria- attributes, keyboard interactions, and focus management.

### **8\. Avoid**

* **Description:** A list of common anti-patterns and what *not* to do.  
* **Purpose for LLM:** Provides *constraints* and negative examples (e.g., "Do not use generic error messages," "Do not use multiple primary CTAs"). This is crucial for refining generative output and preventing common mistakes.

### **9\. Related**

* **Description:** Cross-references to other patterns (e.g., "See: Forms").  
* **Purpose for LLM:** Builds a semantic map of the design system, allowing it to understand how patterns like "Settings" and "Auth Flows" are connected.

---

---

### **File: docs/design/governance/tokens-and-governance.md**

---

# **Design System Governance**

This document outlines the principles for scaling the design system, specifically its tokens (the design grammar) and its contribution model (the process for managing change).

## **1\. Token Naming Conventions**

The token naming convention is the single most important tool for ensuring consistency at scale.43 A system of design tokens is the "single source of truth to name and store design decisions".44 A well-designed token system guides all choices toward a semantic, predictable, and scalable end. A poorly designed system allows for aesthetic, one-off choices that create design debt.

We will adopt the three-tier token model, synthesized from Material Design 3 45, as it provides the ideal level of abstraction for both human designers and generative AI.

### **Tier 1: Reference Tokens**

* **Purpose:** The "raw" palette of available, static values. These are options, not decisions. They make up all of the style options available in the system.45  
* **Naming:** ref.\[category\].\[value\] (e.g., md.ref.palette.secondary200 46)  
* **Examples:**  
  * ref.palette.blue-400  
  * ref.typography.font-family.sans  
  * ref.spacing.8px  
* **Governance:** An LLM or junior designer should *never* use these directly in a component. They are for the sole purpose of *defining* System Tokens.

### **Tier 2: System Tokens (The "Semantic Layer")**

* **Purpose:** This tier represents the design decisions and roles. This is the core language of the design system. It maps *semantic roles* (e.g., "interactive color," "brand color," "background color") to a specific Reference Token.45  
* **Naming:** sys.\[category\].\[role\].\[state\] (e.g., md.sys.color.secondary-container 46)  
* **Examples:**  
  * sys.color.interactive.default (maps to: ref.palette.blue-500)  
  * sys.color.interactive.hover (maps to: ref.palette.blue-600)  
  * sys.color.background.default (maps to: ref.palette.neutral-0)  
  * sys.typography.heading.large (maps to: ref.typography.size.48px)  
* **Governance:** **This is the primary token set an LLM must use.** When instructed to "make a button," the LLM will be trained to use sys.color.interactive.default for its background, not the raw blue-500 value.

### **Tier 3: Component Tokens**

* **Purpose:** Component-specific overrides or aliases. These tokens define the design properties for a specific element 45 and should point to System Tokens, providing a local-level abstraction.  
* **Naming:** comp.\[component-name\].\[element\].\[role\].\[state\] (e.g., md.fab.container.color 45)  
* **Examples:**  
  * comp.button.primary.background.default (maps to: sys.color.interactive.default)  
  * comp.button.secondary.background.default (maps to: sys.color.neutral-subtle.default)  
  * comp.card.container.background (maps to: sys.color.background.default)  
* **Governance:** An LLM *can* use these, but it is more robust to train it on System Tokens, as they are more universal. Component tokens are primarily for component developers.

This 3-tier system 45 is the *mechanism* that delivers Atlassian's "consistency at scale".43 It separates *what is available* (Reference) from *what we decided* (System), which provides the perfect semantic grammar for a generative AI.

### **Three-Tier Token Model Summary**

| Token Tier | Naming Schema (example) | Purpose (The "Why") | Primary Consumer |
| :---- | :---- | :---- | :---- |
| **Reference** | ref.palette.blue-400 | The raw palette. A static value. Options. 45 | System Admins |
| **System** | sys.color.interactive.default | The design decision. A semantic role. 45 | **AI Agents**, Designers, Engineers |
| **Component** | comp.button.background.default | A component-specific alias. 45 | Component Developers |

## **2\. Versioning and Contribution Model**

* **Philosophy:** The design system is a "product serving products".47 It is not a one-time project; it is a living product that evolves.  
* **Core Model:** The system is managed by a central "Design Infrastructure" or "Design Engineering" team (per GitHub 48). This core team is responsible for the tokens, governance, and core components.  
* **Contribution Model:** We will follow the open-source model of IBM Carbon.49  
  * Anyone can contribute code, design, and documentation.49  
  * A **Contributor License Agreement (CLA)** is required from all contributors before code can be reviewed and merged. This protects the project and the contributor.49  
  * All contributions are managed via **GitHub pull requests** and must be reviewed by the core team.49  
* **Versioning:** The design system packages (e.g., @our-system/react, @our-system/tokens) must follow semantic versioning (SemVer) to communicate changes and avoid breaking consumer products.  
* **Governance at Scale:** Consistency is enforced not just by documentation, but by embedding the system's rules into the workflow. This is achieved by providing robust, centralized tools like:  
  * Figma libraries that use the tokens.  
  * ESLint plugins that enforce token usage and accessibility rules.44  
  * Production-ready, reusable components that have best practices "built-in".43

#### **Works cited**

1. Dashboards \- Carbon Design System, accessed on November 6, 2025, [https://carbondesignsystem.com/data-visualization/dashboards/](https://carbondesignsystem.com/data-visualization/dashboards/)  
2. Layout \- Shopify Dev Docs, accessed on November 6, 2025, [https://shopify.dev/docs/apps/design/layout](https://shopify.dev/docs/apps/design/layout)  
3. Layout basics \- Layout – Material Design 3, accessed on November 6, 2025, [https://m3.material.io/foundations/layout/understanding-layout/overview](https://m3.material.io/foundations/layout/understanding-layout/overview)  
4. Applying layout – Material Design 3, accessed on November 6, 2025, [https://m3.material.io/foundations/layout/applying-layout](https://m3.material.io/foundations/layout/applying-layout)  
5. Tremor – Copy-and-Paste Tailwind CSS UI Components for Charts and Dashboards, accessed on November 6, 2025, [https://tremor.so/](https://tremor.so/)  
6. Build a React dashboard with Tremor \- LogRocket Blog, accessed on November 6, 2025, [https://blog.logrocket.com/build-react-dashboard-tremor/](https://blog.logrocket.com/build-react-dashboard-tremor/)  
7. Building a React Admin Dashboard with Tremor Library \- Refine dev, accessed on November 6, 2025, [https://refine.dev/blog/building-react-admin-dashboard-with-tremor/](https://refine.dev/blog/building-react-admin-dashboard-with-tremor/)  
8. Empty states \- Carbon Design System, accessed on November 6, 2025, [https://carbondesignsystem.com/patterns/empty-states-pattern/](https://carbondesignsystem.com/patterns/empty-states-pattern/)  
9. Color \- Foundations \- Atlassian Design System, accessed on November 6, 2025, [https://atlassian.design/foundations/color](https://atlassian.design/foundations/color)  
10. 40 best landing page examples of 2024 (for your swipe file) \- Unbounce, accessed on November 6, 2025, [https://unbounce.com/landing-page-examples/best-landing-page-examples/](https://unbounce.com/landing-page-examples/best-landing-page-examples/)  
11. The Anatomy of High Conversion landing Pages | Primer, accessed on November 6, 2025, [https://goprimer.com/blog/anatomy-of-high-conversion-landing-pages/](https://goprimer.com/blog/anatomy-of-high-conversion-landing-pages/)  
12. Overview \- Illustrations \- Atlassian Design System, accessed on November 6, 2025, [https://atlassian.design/foundations/illustrations](https://atlassian.design/foundations/illustrations)  
13. Free Landing page template using Shadcn, React, Typescript and Tailwind \- GitHub, accessed on November 6, 2025, [https://github.com/leoMirandaa/shadcn-landing-page](https://github.com/leoMirandaa/shadcn-landing-page)  
14. Primer Landing Page UI \- SaaSFrame, accessed on November 6, 2025, [https://www.saasframe.io/examples/primer-landing-page](https://www.saasframe.io/examples/primer-landing-page)  
15. Shadcn Landing Page \- Templates, accessed on November 6, 2025, [https://www.shadcn.io/template/leomirandaa-shadcn-landing-page](https://www.shadcn.io/template/leomirandaa-shadcn-landing-page)  
16. Shadcn/UI Landing Page Template for React \- NextGen JavaScript, accessed on November 6, 2025, [https://next.jqueryscript.net/shadcn-ui/landing-page-template-react/](https://next.jqueryscript.net/shadcn-ui/landing-page-template-react/)  
17. Overview \- Language and grammar \- Atlassian Design System, accessed on November 6, 2025, [https://atlassian.design/content/language-and-grammar](https://atlassian.design/content/language-and-grammar)  
18. Content | Primer, accessed on November 6, 2025, [https://primer.style/product/getting-started/foundations/content/](https://primer.style/product/getting-started/foundations/content/)  
19. Overview \- Voice tone \- Atlassian Design System, accessed on November 6, 2025, [https://atlassian.design/content/voice-tone](https://atlassian.design/content/voice-tone)  
20. Forms \- Carbon Design System, accessed on November 6, 2025, [https://carbondesignsystem.com/patterns/forms-pattern/](https://carbondesignsystem.com/patterns/forms-pattern/)  
21. Layout | Primer, accessed on November 6, 2025, [https://primer.style/product/getting-started/foundations/layout/](https://primer.style/product/getting-started/foundations/layout/)  
22. Layout — Shopify Polaris Vue by ownego, accessed on November 6, 2025, [https://ownego.github.io/polaris-vue/components/Layout](https://ownego.github.io/polaris-vue/components/Layout)  
23. Layout and structure — Shopify Polaris Vue by ownego, accessed on November 6, 2025, [https://ownego.github.io/polaris-vue/components/layout-and-structure](https://ownego.github.io/polaris-vue/components/layout-and-structure)  
24. Forms \- Patterns \- Atlassian Design System, accessed on November 6, 2025, [https://atlassian.design/patterns/forms](https://atlassian.design/patterns/forms)  
25. Shadcn Tabs, accessed on November 6, 2025, [https://www.shadcn.io/ui/tabs](https://www.shadcn.io/ui/tabs)  
26. Login \- Carbon Design System, accessed on November 6, 2025, [https://carbondesignsystem.com/patterns/login-pattern/](https://carbondesignsystem.com/patterns/login-pattern/)  
27. Authentication \- Shadcn UI, accessed on November 6, 2025, [https://ui.shadcn.com/examples/authentication](https://ui.shadcn.com/examples/authentication)  
28. React Hook Form \- Shadcn UI, accessed on November 6, 2025, [https://ui.shadcn.com/docs/forms/react-hook-form](https://ui.shadcn.com/docs/forms/react-hook-form)  
29. How to Create a Form in Next.js Using react-hook-form, Zod, and shadcn for Styling, accessed on November 6, 2025, [https://medium.com/@paragvadgama123/how-to-create-a-login-form-in-next-js-using-react-hook-form-zod-and-shadcn-for-styling-d1738dc9b7f2](https://medium.com/@paragvadgama123/how-to-create-a-login-form-in-next-js-using-react-hook-form-zod-and-shadcn-for-styling-d1738dc9b7f2)  
30. Login \- Carbon Design System, accessed on November 6, 2025, [https://carbon-website-git-fork-theiliad-add-horizontal-bar-charts.carbon-design-system.vercel.app/patterns/login-pattern](https://carbon-website-git-fork-theiliad-add-horizontal-bar-charts.carbon-design-system.vercel.app/patterns/login-pattern)  
31. Text fields – Material Design 3, accessed on November 6, 2025, [https://m3.material.io/components/text-fields/guidelines](https://m3.material.io/components/text-fields/guidelines)  
32. Content \- Shopify Dev Docs, accessed on November 6, 2025, [https://shopify.dev/docs/apps/design/content](https://shopify.dev/docs/apps/design/content)  
33. Content guidelines \- Carbon Design System, accessed on November 6, 2025, [https://carbondesignsystem.com/guidelines/content/overview/](https://carbondesignsystem.com/guidelines/content/overview/)  
34. What Is Brand Tone? How To Craft Your Brand Tone \+ Examples (2025) \- Shopify, accessed on November 6, 2025, [https://www.shopify.com/blog/defining-tone](https://www.shopify.com/blog/defining-tone)  
35. Material's Communication Principles: Intro to UX Writing \- Google Codelabs, accessed on November 6, 2025, [https://codelabs.developers.google.com/codelabs/material-communication-guidance](https://codelabs.developers.google.com/codelabs/material-communication-guidance)  
36. Style guide – Material Design 3, accessed on November 6, 2025, [https://m3.material.io/foundations/content-design/style-guide](https://m3.material.io/foundations/content-design/style-guide)  
37. Content \- Carbon Design System, accessed on November 6, 2025, [https://carbon-website-git-fork-aagonzales-dialog-pattern.carbon-design-system.vercel.app/guidelines/content/general](https://carbon-website-git-fork-aagonzales-dialog-pattern.carbon-design-system.vercel.app/guidelines/content/general)  
38. Style guide – Material Design 3, accessed on November 6, 2025, [https://m3.material.io/foundations/content-design/style-guide/word-choice](https://m3.material.io/foundations/content-design/style-guide/word-choice)  
39. Raising our voice. As Shopify's design language evolved… | by Gene Shannon \- Medium, accessed on November 6, 2025, [https://medium.com/shopify-ux/raising-our-voice-c57d19bfd013](https://medium.com/shopify-ux/raising-our-voice-c57d19bfd013)  
40. Overview \- Content \- Atlassian Design System, accessed on November 6, 2025, [https://atlassian.design/content](https://atlassian.design/content)  
41. Documentation \- Primer Design System, accessed on November 6, 2025, [https://primer.style/product/contribute/documentation/](https://primer.style/product/contribute/documentation/)  
42. components and patterns require usage, style, code, and accessibility guidance on the Carbon website. Check out the markdown templates and instructions below to contribute documentation smoothly., accessed on November 6, 2025, [https://carbondesignsystem.com/contributing/documentation/](https://carbondesignsystem.com/contributing/documentation/)  
43. Learn about the design system, the benefits of using it, and our ..., accessed on November 6, 2025, [https://atlassian.design/get-started/about-atlassian-design-system](https://atlassian.design/get-started/about-atlassian-design-system)  
44. Atlassian Design System, accessed on November 6, 2025, [https://atlassian.design/](https://atlassian.design/)  
45. Design tokens – Material Design 3, accessed on November 6, 2025, [https://m3.material.io/foundations/design-tokens](https://m3.material.io/foundations/design-tokens)  
46. Glossary – Material Design 3, accessed on November 6, 2025, [https://m3.material.io/foundations/glossary](https://m3.material.io/foundations/glossary)  
47. How to build a design system that will last \- Work Life by Atlassian, accessed on November 6, 2025, [https://www.atlassian.com/blog/add-ons/what-is-design-system-how-to-build-one](https://www.atlassian.com/blog/add-ons/what-is-design-system-how-to-build-one)  
48. Primer, accessed on November 6, 2025, [https://primer.style/](https://primer.style/)  
49. Previous Contributing: Get started \- Carbon Design System, accessed on November 6, 2025, [https://carbondesignsystem.com/contributing/get-started/overview/](https://carbondesignsystem.com/contributing/get-started/overview/)  
50. Governance \- Carbon Design System, accessed on November 6, 2025, [https://carbon-website-git-fork-aagonzales-dialog-pattern.carbon-design-system.vercel.app/how-to-contribute/governance](https://carbon-website-git-fork-aagonzales-dialog-pattern.carbon-design-system.vercel.app/how-to-contribute/governance)
