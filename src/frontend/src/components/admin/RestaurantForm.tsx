import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CUISINES } from "@/lib/constants";
import { blobUrl } from "@/lib/format";
import type { Restaurant, RestaurantInput } from "@/types";
import { ExternalBlob } from "@caffeineai/object-storage";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

interface RestaurantFormProps {
  /** Existing restaurant when editing; omitted when creating. */
  restaurant?: Restaurant;
  onSubmit: (values: RestaurantInput) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage?: string;
  submitLabel?: string;
}

interface FormState {
  name: string;
  cuisine: string;
  description: string;
  deliveryFeePesos: string;
  estimatedDeliveryMinutes: string;
  operatingHours: string;
  promoLabel: string;
}

function initialState(restaurant?: Restaurant): FormState {
  return {
    name: restaurant?.name ?? "",
    cuisine: restaurant?.cuisine ?? CUISINES[0],
    description: restaurant?.description ?? "",
    deliveryFeePesos:
      restaurant !== undefined
        ? String(Number(restaurant.deliveryFee) / 100)
        : "49",
    estimatedDeliveryMinutes:
      restaurant !== undefined
        ? String(Number(restaurant.estimatedDeliveryMinutes))
        : "30",
    operatingHours: restaurant?.operatingHours ?? "10:00 AM – 10:00 PM",
    promoLabel: restaurant?.promoLabel ?? "",
  };
}

/** Create/edit form for a marketplace restaurant. Prices are entered in pesos. */
export function RestaurantForm({
  restaurant,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
  submitLabel,
}: RestaurantFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(restaurant));
  const [coverBlob, setCoverBlob] = useState<ExternalBlob | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(() =>
    blobUrl(restaurant?.coverImageUrl),
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCoverChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }
    setUploadError(null);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes, file.type, file.name);
    setCoverBlob(blob);
    setCoverPreview(blob.getDirectURL());
  };

  const clearCover = () => {
    setCoverBlob(null);
    setCoverPreview("");
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const deliveryFeePesos = Number.parseFloat(form.deliveryFeePesos);
    const estimatedMinutes = Number.parseInt(form.estimatedDeliveryMinutes, 10);
    const promoLabel = form.promoLabel.trim();

    // The backend field is `?Storage.ExternalBlob`. A new upload wins; an
    // untouched existing image is re-wrapped from its proxy URL; a cleared
    // image submits undefined so the backend stores no cover.
    const coverImageUrl =
      coverBlob ??
      (coverPreview ? ExternalBlob.fromURL(coverPreview) : undefined);

    const values: RestaurantInput = {
      name: form.name.trim(),
      cuisine: form.cuisine,
      description: form.description.trim(),
      coverImageUrl,
      deliveryFee: BigInt(
        Math.max(0, Math.round((deliveryFeePesos || 0) * 100)),
      ),
      estimatedDeliveryMinutes: BigInt(
        Math.max(1, Number.isNaN(estimatedMinutes) ? 30 : estimatedMinutes),
      ),
      operatingHours: form.operatingHours.trim(),
      ...(promoLabel ? { promoLabel } : {}),
    };

    onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="admin.restaurant_form"
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="restaurant-name">Restaurant name</Label>
          <Input
            id="restaurant-name"
            data-ocid="admin.restaurant_name_input"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Aling Nena's Carinderia"
            required
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurant-cuisine">Cuisine</Label>
          <Select
            value={form.cuisine}
            onValueChange={(value) => update("cuisine", value)}
          >
            <SelectTrigger
              id="restaurant-cuisine"
              data-ocid="admin.restaurant_cuisine_select"
              className="w-full rounded-xl"
            >
              <SelectValue placeholder="Select a cuisine" />
            </SelectTrigger>
            <SelectContent>
              {CUISINES.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurant-hours">Operating hours</Label>
          <Input
            id="restaurant-hours"
            data-ocid="admin.restaurant_hours_input"
            value={form.operatingHours}
            onChange={(event) => update("operatingHours", event.target.value)}
            placeholder="10:00 AM – 10:00 PM"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="restaurant-description">Description</Label>
          <Textarea
            id="restaurant-description"
            data-ocid="admin.restaurant_description_textarea"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Home-style Filipino favorites cooked to order."
            rows={3}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="restaurant-cover">Cover image</Label>
          <input
            ref={fileInputRef}
            id="restaurant-cover"
            data-ocid="admin.restaurant_cover_input"
            type="file"
            accept="image/*"
            onChange={(event) => void handleCoverChange(event)}
            className="sr-only"
          />
          {coverPreview ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              <img
                src={coverPreview}
                alt="Restaurant cover preview"
                className="h-40 w-full object-cover"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearCover}
                data-ocid="admin.restaurant_cover_remove_button"
                className="absolute right-2 top-2 rounded-full bg-background/90"
              >
                <X className="size-4" aria-hidden="true" />
                Remove
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              data-ocid="admin.restaurant_cover_upload_button"
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-sm text-muted-foreground transition-smooth hover:border-primary/50 hover:bg-muted"
            >
              <ImagePlus className="size-6 text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">
                Upload a cover photo
              </span>
              <span className="text-xs">JPG, PNG, or WebP</span>
            </button>
          )}
          {uploadError ? (
            <p
              data-ocid="admin.restaurant_cover.error_state"
              className="text-sm text-destructive"
            >
              {uploadError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurant-fee">Delivery fee (₱)</Label>
          <Input
            id="restaurant-fee"
            data-ocid="admin.restaurant_fee_input"
            value={form.deliveryFeePesos}
            onChange={(event) => update("deliveryFeePesos", event.target.value)}
            inputMode="decimal"
            placeholder="49"
            className="price rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurant-eta">Estimated delivery (minutes)</Label>
          <Input
            id="restaurant-eta"
            data-ocid="admin.restaurant_eta_input"
            value={form.estimatedDeliveryMinutes}
            onChange={(event) =>
              update("estimatedDeliveryMinutes", event.target.value)
            }
            inputMode="numeric"
            placeholder="30"
            className="price rounded-xl"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="restaurant-promo">Promo label (optional)</Label>
          <Input
            id="restaurant-promo"
            data-ocid="admin.restaurant_promo_input"
            value={form.promoLabel}
            onChange={(event) => update("promoLabel", event.target.value)}
            placeholder="Free delivery over ₱500"
            className="rounded-xl"
          />
        </div>
      </div>

      {errorMessage ? (
        <p
          data-ocid="admin.restaurant_form.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          data-ocid="admin.restaurant_cancel_button"
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || form.name.trim() === ""}
          data-ocid="admin.restaurant_submit_button"
          className="rounded-full font-semibold shadow-card"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isPending
            ? "Saving…"
            : (submitLabel ??
              (restaurant ? "Save changes" : "Create restaurant"))}
        </Button>
      </div>
    </form>
  );
}
