import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { blobUrl } from "@/lib/format";
import type { MenuItem, MenuItemInput } from "@/types";
import { ExternalBlob } from "@caffeineai/object-storage";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

interface MenuItemFormProps {
  /** Existing dish when editing; omitted when adding. */
  item?: MenuItem;
  onSubmit: (values: MenuItemInput) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage?: string;
  submitLabel?: string;
}

interface FormState {
  name: string;
  description: string;
  pricePesos: string;
  category: string;
  available: boolean;
}

function initialState(item?: MenuItem): FormState {
  return {
    name: item?.name ?? "",
    description: item?.description ?? "",
    pricePesos: item !== undefined ? String(Number(item.price) / 100) : "",
    category: item?.category ?? "",
    available: item?.available ?? true,
  };
}

/** Add/edit form for a dish. Price is entered in pesos, stored as centavos. */
export function MenuItemForm({
  item,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
  submitLabel,
}: MenuItemFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(item));
  const [imageBlob, setImageBlob] = useState<ExternalBlob | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(() =>
    blobUrl(item?.imageUrl),
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleImageChange = async (
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
    setImageBlob(blob);
    setImagePreview(blob.getDirectURL());
  };

  const clearImage = () => {
    setImageBlob(null);
    setImagePreview("");
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pricePesos = Number.parseFloat(form.pricePesos);

    // The backend field is `?Storage.ExternalBlob`. A new upload wins; an
    // untouched existing image is re-wrapped from its proxy URL; a cleared
    // image submits undefined so the backend stores no photo.
    const imageUrl =
      imageBlob ??
      (imagePreview ? ExternalBlob.fromURL(imagePreview) : undefined);

    const values: MenuItemInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: BigInt(Math.max(0, Math.round((pricePesos || 0) * 100))),
      category: form.category.trim(),
      imageUrl,
      available: form.available,
    };

    onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="admin.menu_item_form"
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="menu-item-name">Dish name</Label>
          <Input
            id="menu-item-name"
            data-ocid="admin.menu_item_name_input"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Chicken Adobo Rice Bowl"
            required
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="menu-item-price">Price (₱)</Label>
          <Input
            id="menu-item-price"
            data-ocid="admin.menu_item_price_input"
            value={form.pricePesos}
            onChange={(event) => update("pricePesos", event.target.value)}
            inputMode="decimal"
            placeholder="149"
            required
            className="price rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="menu-item-category">Category</Label>
          <Input
            id="menu-item-category"
            data-ocid="admin.menu_item_category_input"
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
            placeholder="Rice meals"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="menu-item-description">Description</Label>
          <Textarea
            id="menu-item-description"
            data-ocid="admin.menu_item_description_textarea"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Slow-braised pork in soy, garlic, and vinegar."
            rows={3}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="menu-item-image">Dish photo</Label>
          <input
            ref={fileInputRef}
            id="menu-item-image"
            data-ocid="admin.menu_item_image_input"
            type="file"
            accept="image/*"
            onChange={(event) => void handleImageChange(event)}
            className="sr-only"
          />
          {imagePreview ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              <img
                src={imagePreview}
                alt="Dish preview"
                className="h-40 w-full object-cover"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearImage}
                data-ocid="admin.menu_item_image_remove_button"
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
              data-ocid="admin.menu_item_image_upload_button"
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-sm text-muted-foreground transition-smooth hover:border-primary/50 hover:bg-muted"
            >
              <ImagePlus className="size-6 text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">
                Upload a dish photo
              </span>
              <span className="text-xs">JPG, PNG, or WebP</span>
            </button>
          )}
          {uploadError ? (
            <p
              data-ocid="admin.menu_item_image.error_state"
              className="text-sm text-destructive"
            >
              {uploadError}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 px-4 py-3 sm:col-span-2">
          <div className="space-y-0.5">
            <Label htmlFor="menu-item-available">Available to order</Label>
            <p className="text-xs text-muted-foreground">
              Unavailable dishes stay on the menu but cannot be ordered.
            </p>
          </div>
          <Switch
            id="menu-item-available"
            data-ocid="admin.menu_item_available_switch"
            checked={form.available}
            onCheckedChange={(checked) => update("available", checked)}
          />
        </div>
      </div>

      {errorMessage ? (
        <p
          data-ocid="admin.menu_item_form.error_state"
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
          data-ocid="admin.menu_item_cancel_button"
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isPending ||
            form.name.trim() === "" ||
            form.pricePesos.trim() === ""
          }
          data-ocid="admin.menu_item_submit_button"
          className="rounded-full font-semibold shadow-card"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isPending
            ? "Saving…"
            : (submitLabel ?? (item ? "Save dish" : "Add dish"))}
        </Button>
      </div>
    </form>
  );
}
