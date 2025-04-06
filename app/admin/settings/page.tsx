"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      })
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your store's general settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" defaultValue="Online Boutique" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-description">Store Description</Label>
                <Textarea
                  id="store-description"
                  defaultValue="A premium clothing boutique offering the latest fashion trends."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input id="contact-email" type="email" defaultValue="contact@boutique.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <Input id="contact-phone" type="tel" defaultValue="+1 (555) 123-4567" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenance-mode" />
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>Configure your store's appearance and behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="CST">Central Time (CST)</option>
                  <option value="MST">Mountain Time (MST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="products-per-page">Products Per Page</Label>
                <Input id="products-per-page" type="number" defaultValue="12" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="show-out-of-stock" defaultChecked />
                <Label htmlFor="show-out-of-stock">Show Out of Stock Products</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="enable-reviews" defaultChecked />
                <Label htmlFor="enable-reviews">Enable Product Reviews</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment methods and options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Methods</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="enable-card" defaultChecked />
                    <Label htmlFor="enable-card">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="enable-mobile-money" defaultChecked />
                    <Label htmlFor="enable-mobile-money">Mobile Money</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="enable-bank-transfer" defaultChecked />
                    <Label htmlFor="enable-bank-transfer">Bank Transfer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="enable-pay-on-delivery" defaultChecked />
                    <Label htmlFor="enable-pay-on-delivery">Pay on Delivery</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input id="tax-rate" type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency-symbol">Currency Symbol</Label>
                <Input id="currency-symbol" defaultValue="$" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="enable-invoices" defaultChecked />
                <Label htmlFor="enable-invoices">Automatically Generate Invoices</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
              <CardDescription>Configure shipping methods and delivery options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Shipping Methods</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="enable-standard" defaultChecked />
                    <Label htmlFor="enable-standard">Standard Shipping</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="enable-express" defaultChecked />
                    <Label htmlFor="enable-express">Express Shipping</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="enable-pickup" defaultChecked />
                    <Label htmlFor="enable-pickup">Store Pickup</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="standard-rate">Standard Shipping Rate</Label>
                <Input id="standard-rate" type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="express-rate">Express Shipping Rate</Label>
                <Input id="express-rate" type="number" defaultValue="25" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="free-shipping-threshold" defaultChecked />
                <Label htmlFor="free-shipping-threshold">Enable Free Shipping Threshold</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="free-shipping-amount">Free Shipping Threshold Amount</Label>
                <Input id="free-shipping-amount" type="number" defaultValue="100" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email and SMS notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Admin Notifications</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="admin-new-order" defaultChecked />
                    <Label htmlFor="admin-new-order">New Order</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="admin-low-stock" defaultChecked />
                    <Label htmlFor="admin-low-stock">Low Stock Alert</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="admin-new-customer" defaultChecked />
                    <Label htmlFor="admin-new-customer">New Customer Registration</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Customer Notifications</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="customer-order-confirmation" defaultChecked />
                    <Label htmlFor="customer-order-confirmation">Order Confirmation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="customer-shipping-update" defaultChecked />
                    <Label htmlFor="customer-shipping-update">Shipping Updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="customer-delivery-confirmation" defaultChecked />
                    <Label htmlFor="customer-delivery-confirmation">Delivery Confirmation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="customer-promotional" defaultChecked />
                    <Label htmlFor="customer-promotional">Promotional Emails</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-email">Sender Email</Label>
                <Input id="sender-email" type="email" defaultValue="notifications@boutique.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-name">Sender Name</Label>
                <Input id="sender-name" defaultValue="Online Boutique" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>Manage admin users and permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Admin Roles</Label>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Admin User</TableCell>
                        <TableCell>admin@example.com</TableCell>
                        <TableCell>Super Admin</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Sales Manager</TableCell>
                        <TableCell>sales@example.com</TableCell>
                        <TableCell>Manager</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Inventory Clerk</TableCell>
                        <TableCell>inventory@example.com</TableCell>
                        <TableCell>Staff</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              <Button variant="outline">Add New Admin User</Button>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

