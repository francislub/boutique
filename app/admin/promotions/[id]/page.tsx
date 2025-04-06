"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { getAllPromotions, updatePromotion, deletePromotion } from "@/lib/actions/promotion"
import { Loader2, ArrowLeft } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EditPromotionPage({ params }: { params: { id: string } }) {
  const promotionId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [promotion, setPromotion] = useState(null)

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    maxUses: "",
    startDate: "",
    endDate: "",
    isActive: true,
  })

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const result = await getAllPromotions(true)
        if (result.success) {
          const foundPromotion = result.data.find((p) => p.id === promotionId)
          if (foundPromotion) {
            setPromotion(foundPromotion)
            setFormData({
              code: foundPromotion.code,
              description: foundPromotion.description || "",
              discountType: foundPromotion.discountType,
              discountValue: foundPromotion.discountValue.toString(),
              minPurchase: foundPromotion.minPurchase?.toString() || "",
              maxUses: foundPromotion.maxUses?.toString() || "",
              startDate: new Date(foundPromotion.startDate).toISOString().split("T")[0],
              endDate: new Date(foundPromotion.endDate).toISOString().split("T")[0],
              isActive: foundPromotion.isActive,
            })
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load promotion",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPromotion()
  }, [promotionId, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const result = await updatePromotion(promotionId, {
        code: formData.code,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number.parseFloat(formData.discountValue),
        minPurchase: formData.minPurchase ? Number.parseFloat(formData.minPurchase) : null,
        maxUses: formData.maxUses ? Number.parseInt(formData.maxUses) : null,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        isActive: formData.isActive,
      })

      if (result.success) {
        toast({
          title: "Promotion updated",
          description: "The promotion has been updated successfully.",
        })
        router.push("/admin/promotions")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update promotion",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deletePromotion(promotionId)

      if (result.success) {
        toast({
          title: "Promotion deleted",
          description: "The promotion has been deleted successfully.",
        })
        router.push("/admin/promotions")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete promotion",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!promotion) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/admin/promotions")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Promotions
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold">Promotion Not Found</h2>
            <p className="text-muted-foreground">The promotion you're looking for doesn't exist or has been deleted.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/admin/promotions")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Promotions
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Promotion</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Promotion"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the promotion code and it will no longer be
                available for customers to use.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Promotion Information</CardTitle>
            <CardDescription>Edit the promotion details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Promotion Code</Label>
              <Input id="code" name="code" value={formData.code} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, discountType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">Discount Value</Label>
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  step={formData.discountType === "percentage" ? "1" : "0.01"}
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  value={formData.discountValue}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Minimum Purchase (Optional)</Label>
                <Input
                  id="minPurchase"
                  name="minPurchase"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minPurchase}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">Maximum Uses (Optional)</Label>
                <Input
                  id="maxUses"
                  name="maxUses"
                  type="number"
                  min="0"
                  value={formData.maxUses}
                  onChange={handleChange}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="text-sm text-muted-foreground">Used {promotion.usedCount} times</div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/promotions")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

