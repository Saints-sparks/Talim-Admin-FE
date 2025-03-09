"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import loginIllustration from "../../../public/Super-Admin.png"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const router = useRouter()
  
  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      router.push("/talimadmindashboard") // Redirect to dashboard
    }, 1000)
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left Section */}
      <div className="relative flex-col p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome to TALIM</CardTitle>
              <p className="text-sm text-muted-foreground">
                Login with your email
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-4 text-gray-500">
                  <div className="space-y-2 ">
                    <Label htmlFor="name">Name*</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email*</Label>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password*</Label>
                    <Input
                      id="password"
                      placeholder="Create a password"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="new-password"
                      autoCorrect="off"
                      disabled={isLoading}
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Keep me signed in
                    </label>
                  </div>
                  <Button 
                    className="w-full bg-indigo-700 hover:bg-indigo-800" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    disabled={isLoading} 
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up with Google
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="flex justify-between text-sm text-muted-foreground">
            <p>© TALIM 2024</p>
            <a href="mailto:help@talim.com" className="hover:underline">help@talim.com</a>
          </div>
        </div>
      </div>

      {/* Right Section - Illustration */}
      <div className="relative hidden lg:flex h-full flex-col items-center justify-center bg-gray-50">
        <div className="relative w-full max-w-[500px] aspect-square">
          <Image
            src={loginIllustration}
            alt="Login illustration showing a person interacting with a computer interface"
            fill
            priority
            className="object-contain p-8"
          />
        </div>
      </div>
    </div>
  )
}

