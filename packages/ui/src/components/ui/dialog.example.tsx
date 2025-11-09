'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

/**
 * Interactive examples demonstrating all Dialog variants and states.
 * Use this as a visual reference or copy examples into your own code.
 */
export function DialogExamples() {
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="space-y-8 p-8">
      <section>
        <h3 className="text-lg font-semibold mb-4">Basic Dialog</h3>
        <Dialog>
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Open Dialog
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a basic dialog with a title and description.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm">Dialog content goes here.</p>
          </DialogContent>
        </Dialog>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Confirmation Dialog</h3>
        <Dialog>
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md">
              Delete Account
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md">
                  Cancel
                </button>
              </DialogClose>
              <DialogClose asChild>
                <button
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md"
                  onClick={() => {
                    // Perform delete action
                    console.log('Account deleted');
                  }}
                >
                  Delete
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Form Dialog</h3>
        <Dialog>
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Edit Profile
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Profile saved');
              }}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <input
                  id="username"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="@johndoe"
                />
              </div>
              <DialogFooter>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Save changes
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Controlled Dialog</h3>
        <div className="space-y-2">
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => setIsOpen1(true)}
          >
            Open Controlled Dialog
          </button>
          <Dialog open={isOpen1} onOpenChange={setIsOpen1}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Controlled Dialog</DialogTitle>
                <DialogDescription>
                  This dialog's state is controlled externally via React state.
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm">
                The open state is managed by the parent component, allowing for programmatic
                control.
              </p>
              <DialogFooter>
                <button
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  onClick={() => setIsOpen1(false)}
                >
                  Close
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Information Dialog</h3>
        <Dialog>
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md">
              Learn More
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>About This Feature</DialogTitle>
              <DialogDescription>Here's what you need to know</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <p className="text-sm">
                This feature allows you to manage your workspace settings efficiently. You can
                customize various aspects of your workflow including:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Team permissions and roles</li>
                <li>Notification preferences</li>
                <li>Integration settings</li>
                <li>Billing and subscription</li>
              </ul>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                  Got it
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Wide Dialog</h3>
        <Dialog>
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              View Details
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detailed Information</DialogTitle>
              <DialogDescription>
                This dialog uses a wider max-width for content that needs more space
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">Left Column</h4>
                <p className="text-sm text-muted-foreground">
                  Content in the left column with additional details and information.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Right Column</h4>
                <p className="text-sm text-muted-foreground">
                  Content in the right column with additional details and information.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Multi-Step Dialog</h3>
        <Dialog open={isOpen2} onOpenChange={setIsOpen2}>
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Start Wizard
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Setup Wizard</DialogTitle>
              <DialogDescription>
                Step {currentStep} of 3:{' '}
                {currentStep === 1
                  ? 'Basic Information'
                  : currentStep === 2
                    ? 'Configuration'
                    : 'Review'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {currentStep === 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Acme Inc."
                  />
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Configuration</label>
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Configure settings..."
                  />
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-2">
                  <p className="text-sm">Review your information before submitting.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <button
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
                onClick={() => {
                  setIsOpen2(false);
                  setCurrentStep(1);
                }}
              >
                Cancel
              </button>
              {currentStep > 1 && (
                <button
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                >
                  Back
                </button>
              )}
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                onClick={() => {
                  if (currentStep < 3) {
                    setCurrentStep((prev) => prev + 1);
                  } else {
                    setIsOpen2(false);
                    setCurrentStep(1);
                  }
                }}
              >
                {currentStep < 3 ? 'Next Step' : 'Finish'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Scrollable Dialog</h3>
        <Dialog>
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Terms & Conditions
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Terms and Conditions</DialogTitle>
              <DialogDescription>Please read our terms carefully</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-96 pr-4">
              <div className="space-y-4 text-sm">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua.
                </p>
                <p>
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                  ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                  fugiat nulla pariatur.
                </p>
                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </p>
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                  doloremque laudantium.
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                  I Accept
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
