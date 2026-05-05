import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Entrance } from "@/components/animation/Entrance";
import { AppIcon } from "@/components/ui/AppIcon";
import {
  useInventory,
  type InventoryProductFormInput,
} from "@/lib/hooks/api/inventory/useInventory";
import type { InventoryItem } from "@/lib/types/api/inventory";

const TOP_CONTENT_INSET = 16;
const TAB_BAR = 88;

type InventoryEditorMode = "create" | "edit";

interface InventoryFormState {
  name: string;
  category: string;
  unit: string;
  storePrice: string;
  buyPrice: string;
  quantityOnHand: string;
  lowStockThreshold: string;
  imageUrl: string;
}

const EMPTY_FORM: InventoryFormState = {
  name: "",
  category: "",
  unit: "pc",
  storePrice: "",
  buyPrice: "0",
  quantityOnHand: "0",
  lowStockThreshold: "0",
  imageUrl: "",
};

export default function InventoryScreen() {
  const { items, isLoading, error, createItem, updateItem, deleteItem } =
    useInventory();
  const [query, setQuery] = useState("");
  const [editorMode, setEditorMode] = useState<InventoryEditorMode | null>(
    null
  );
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const insets = useSafeAreaInsets();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  const lowStockCount = useMemo(
    () => items.filter((i) => i.status === "low").length,
    [items]
  );
  const totalSkus = items.length;
  const isEditorVisible = editorMode !== null;

  const openCreateEditor = () => {
    setEditorMode("create");
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const openEditEditor = (item: InventoryItem) => {
    setEditorMode("edit");
    setEditingItem(item);
    setForm(formFromItem(item));
    setFormError(null);
  };

  const closeEditor = () => {
    if (isSaving) return;
    setEditorMode(null);
    setEditingItem(null);
    setFormError(null);
  };

  const setFormField = (field: keyof InventoryFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const setImageFromPickerResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) return;

    const imageUri = result.assets[0]?.uri;
    if (!imageUri) {
      throw new Error("Selected image did not return a local URI.");
    }

    setFormField("imageUrl", imageUri);
  };

  const pickImageFromGallery = async () => {
    setFormError(null);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Gallery permission is required to choose an image.");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      setImageFromPickerResult(result);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Image selection failed."
      );
    }
  };

  const takePhoto = async () => {
    setFormError(null);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        throw new Error(
          "Camera permission is required to take a product photo."
        );
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      setImageFromPickerResult(result);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Camera capture failed."
      );
    }
  };

  const removeImage = () => {
    setFormField("imageUrl", "");
  };

  const handleSubmit = () => {
    if (!editorMode) return;

    setIsSaving(true);
    setFormError(null);

    try {
      const input = formToMutationInput(form);
      if (editorMode === "edit" && editingItem) {
        updateItem(editingItem.id, input);
      } else {
        createItem(input);
      }
      setEditorMode(null);
      setEditingItem(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editingItem) return;

    Alert.alert(
      "Delete product",
      `Remove ${editingItem.name} from active inventory?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            try {
              deleteItem(editingItem.id);
              setEditorMode(null);
              setEditingItem(null);
            } catch (err) {
              setFormError(err instanceof Error ? err.message : String(err));
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-screen-grouped">
      {/* <AppHeader /> */}
      <FlashList
        data={filtered}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_CONTENT_INSET,
          paddingBottom: TAB_BAR + insets.bottom + 24,
          paddingHorizontal: 16,
        }}
        ListHeaderComponent={
          <View>
            <View className="px-1 pt-1 pb-3">
              <Text className="text-xs font-label font-bold uppercase tracking-widest text-label-muted">
                Manage
              </Text>
              <Text className="text-[30px] font-black leading-[34px] tracking-[-0.2px] text-forest">
                Inventory
              </Text>
            </View>

            <View className="mb-5 flex-row gap-3">
              <Entrance delayMs={50}>
                <View className="flex-1 rounded-2xl p-4 flex-row items-center gap-3 bg-[rgba(255,255,255,0.82)]">
                  <View className="h-10 w-10 rounded-xl items-center justify-center bg-[#2d6a4f]">
                    <AppIcon
                      name="category"
                      size={18}
                      color="#ffffff"
                      strokeWidth={2.5}
                    />
                  </View>
                  <View>
                    <Text className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                      Total SKUs
                    </Text>
                    <Text className="font-headline text-[30px] font-extrabold text-[#1b4332] leading-[34px]">
                      {totalSkus.toLocaleString("en-PH")}
                    </Text>
                  </View>
                </View>
              </Entrance>

              <Entrance delayMs={100}>
                <View className="flex-1 rounded-2xl p-4 flex-row items-center gap-3 bg-[rgba(255,255,255,0.82)] border border-[rgba(106,51,66,0.15)]">
                  <View className="h-10 w-10 rounded-xl items-center justify-center bg-[rgba(106,51,66,0.12)]">
                    <AppIcon
                      name="warning"
                      size={18}
                      color="#6a3342"
                      strokeWidth={2.5}
                    />
                  </View>
                  <View>
                    <Text className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                      Low Stock
                    </Text>
                    <Text className="font-headline text-[30px] font-extrabold text-[#6a3342] leading-[34px]">
                      {lowStockCount}
                    </Text>
                  </View>
                </View>
              </Entrance>
            </View>

            <View className="mb-3">
              <Entrance delayMs={150}>
                <View className="flex-row items-center gap-3 px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.82)]">
                  <AppIcon
                    name="search"
                    size={16}
                    color="#8e8e93"
                    strokeWidth={2}
                  />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search inventory..."
                    placeholderTextColor="#8e8e93"
                    className="flex-1 bg-transparent text-sm font-body text-[#1c1c1e] font-medium"
                    accessibilityLabel="Search inventory"
                  />
                </View>
              </Entrance>
            </View>

            <View className="mb-5 flex-row gap-2">
              <Entrance delayMs={180}>
                <Pressable
                  accessibilityRole="button"
                  className="flex-1 rounded-xl p-2.5 flex-row items-center justify-center bg-[rgba(255,255,255,0.82)]"
                >
                  <AppIcon
                    name="filter_list"
                    size={14}
                    color="#1b4332"
                    strokeWidth={2.5}
                  />
                  <Text className="text-[13px] font-bold text-[#1c1c1e]">
                    Filters
                  </Text>
                </Pressable>
              </Entrance>

              <Entrance delayMs={220}>
                <Pressable
                  accessibilityRole="button"
                  className="flex-1 rounded-xl p-2.5 flex-row items-center justify-center bg-[rgba(255,255,255,0.82)]"
                >
                  <AppIcon
                    name="sort"
                    size={14}
                    color="#1b4332"
                    strokeWidth={2.5}
                  />
                  <Text className="text-[13px] font-bold text-[#1c1c1e]">
                    Sort
                  </Text>
                </Pressable>
              </Entrance>
            </View>

            <Entrance delayMs={250}>
              <View className="mb-3 px-1">
                <Text className="font-body-medium text-[17px] font-bold text-[#1b4332] tracking-[-0.1px]">
                  {query ? `Results for \"${query}\"` : "All Items"}
                </Text>
              </View>
            </Entrance>
          </View>
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <InventoryRow item={item} index={index} onEdit={openEditEditor} />
        )}
        ListEmptyComponent={
          <View className="items-center px-2 py-8">
            <Text className="text-sm font-body text-center text-[#8e8e93]">
              {isLoading
                ? "Loading inventory from this device..."
                : error
                  ? "Inventory unavailable right now."
                  : "No inventory yet. Add your first product to start tracking stock."}
            </Text>
          </View>
        }
        ListFooterComponent={
          <Entrance delayMs={500}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add new product"
              className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[rgba(27,67,50,0.25)] bg-[rgba(255,255,255,0.82)] py-4"
              onPress={openCreateEditor}
            >
              <AppIcon
                name="add_box"
                size={16}
                color="#1b4332"
                strokeWidth={2.5}
              />
              <Text className="font-body-medium font-bold text-[#1b4332] text-sm">
                Add New Product
              </Text>
            </Pressable>
          </Entrance>
        }
      />
      <InventoryEditorModal
        visible={isEditorVisible}
        mode={editorMode ?? "create"}
        form={form}
        error={formError}
        isSaving={isSaving}
        canDelete={editorMode === "edit"}
        onChange={setFormField}
        onPickImage={pickImageFromGallery}
        onTakePhoto={takePhoto}
        onRemoveImage={removeImage}
        onClose={closeEditor}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </View>
  );
}

function InventoryRow(props: {
  item: InventoryItem;
  index: number;
  onEdit: (item: InventoryItem) => void;
}) {
  const { item, index, onEdit } = props;
  const isLow = item.status === "low";
  return (
    <Entrance delayMs={100 + index * 60}>
      <View
        className={`mb-3 overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.82)] ${isLow ? "border-b-[3px] border-b-[rgba(106,51,66,0.3)]" : ""}`}
      >
        <View className="flex-row items-center gap-3 p-4">
          <View className="h-16 w-16 rounded-xl overflow-hidden shrink-0 bg-[rgba(0,0,0,0.03)]">
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 64, height: 64 }}
                contentFit="cover"
              />
            ) : (
              <View className="h-16 w-16 items-center justify-center">
                <AppIcon
                  name="inventory_2"
                  size={24}
                  color="#8e8e93"
                  strokeWidth={1.8}
                />
              </View>
            )}
          </View>

          <View className="flex-1 min-w-0">
            <Text
              className="font-body-medium mb-1 text-[#1c1c1e] font-bold text-sm"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              className="text-xs mb-2 text-[#8e8e93] font-medium"
              numberOfLines={1}
            >
              {item.category}
            </Text>

            <View className="flex-row items-center gap-2">
              <Text className="font-headline font-bold text-[#1b4332] text-[15px]">
                {item.storePriceDisplay}
              </Text>
              <Text
                className={`text-xs font-semibold ${isLow ? "text-[#6a3342]" : "text-[#8e8e93]"}`}
              >
                · {item.available} {item.unit}
              </Text>
            </View>
          </View>

          <View className="flex-col items-end gap-2 shrink-0">
            <View
              className={`px-2.5 py-1 rounded-full ${isLow ? "bg-[rgba(106,51,66,0.1)]" : "bg-[rgba(27,67,50,0.1)]"}`}
            >
              <Text
                className={`text-[10px] font-label font-extrabold uppercase ${isLow ? "text-[#6a3342]" : "text-[#1b4332]"}`}
              >
                {isLow ? "Low Stock" : "Optimal"}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${item.name}`}
              className="h-7 w-7 rounded-full items-center justify-center bg-[rgba(0,0,0,0.02)]"
              onPress={() => onEdit(item)}
            >
              <AppIcon
                name="more_vert"
                size={14}
                color="#8e8e93"
                strokeWidth={2.5}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Entrance>
  );
}

function InventoryEditorModal(props: {
  visible: boolean;
  mode: InventoryEditorMode;
  form: InventoryFormState;
  error: string | null;
  isSaving: boolean;
  canDelete: boolean;
  onChange: (field: keyof InventoryFormState, value: string) => void;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onRemoveImage: () => void;
  onClose: () => void;
  onSubmit: () => void;
  onDelete: () => void;
}) {
  const {
    visible,
    mode,
    form,
    error,
    isSaving,
    canDelete,
    onChange,
    onPickImage,
    onTakePhoto,
    onRemoveImage,
    onClose,
    onSubmit,
    onDelete,
  } = props;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-[rgba(0,0,0,0.22)]"
      >
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-background px-5 pt-4 rounded-t-[22px] max-h-[88%]">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="min-w-0 flex-1">
              <Text className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-[#8e8e93]">
                {mode === "create" ? "New product" : "Edit product"}
              </Text>
              <Text className="font-headline text-2xl font-extrabold text-[#1b4332] leading-[30px]">
                {mode === "create" ? "Add Inventory" : "Update Inventory"}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close editor"
              className="h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,255,255,0.82)]"
              onPress={onClose}
            >
              <AppIcon name="x" size={18} color="#1c1c1e" strokeWidth={2.5} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 28 }}
          >
            <View className="gap-3">
              <InventoryField
                label="Product name"
                value={form.name}
                onChangeText={(value) => onChange("name", value)}
                placeholder="e.g. Instant Coffee"
                autoCapitalize="words"
              />
              <View className="flex-row gap-3">
                <InventoryField
                  label="Category"
                  value={form.category}
                  onChangeText={(value) => onChange("category", value)}
                  placeholder="Beverages"
                  autoCapitalize="words"
                  containerClassName="flex-1"
                />
                <InventoryField
                  label="Unit"
                  value={form.unit}
                  onChangeText={(value) => onChange("unit", value)}
                  placeholder="pc"
                  autoCapitalize="none"
                  containerClassName="w-24"
                />
              </View>
              <View className="flex-row gap-3">
                <InventoryField
                  label="Store price"
                  value={form.storePrice}
                  onChangeText={(value) => onChange("storePrice", value)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  containerClassName="flex-1"
                />
                <InventoryField
                  label="Buy price"
                  value={form.buyPrice}
                  onChangeText={(value) => onChange("buyPrice", value)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  containerClassName="flex-1"
                />
              </View>
              <View className="flex-row gap-3">
                <InventoryField
                  label="On hand"
                  value={form.quantityOnHand}
                  onChangeText={(value) => onChange("quantityOnHand", value)}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  containerClassName="flex-1"
                />
                <InventoryField
                  label="Low alert"
                  value={form.lowStockThreshold}
                  onChangeText={(value) => onChange("lowStockThreshold", value)}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  containerClassName="flex-1"
                />
              </View>
              <InventoryImagePicker
                imageUri={form.imageUrl}
                onPickImage={onPickImage}
                onTakePhoto={onTakePhoto}
                onRemoveImage={onRemoveImage}
              />
            </View>

            {error ? (
              <View className="mt-4 rounded-2xl px-4 py-3 bg-[rgba(106,51,66,0.1)]">
                <Text className="text-sm font-body font-bold text-[#6a3342]">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="mt-5 gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  mode === "create" ? "Save product" : "Update product"
                }
                disabled={isSaving}
                className={`h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-[#1b4332] ${isSaving ? "opacity-70" : "opacity-100"}`}
                onPress={onSubmit}
              >
                {isSaving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <AppIcon
                    name={mode === "create" ? "add_box" : "check"}
                    size={17}
                    color="#ffffff"
                    strokeWidth={2.5}
                  />
                )}
                <Text className="font-body-medium font-bold text-white text-sm">
                  {mode === "create" ? "Save Product" : "Save Changes"}
                </Text>
              </Pressable>

              {canDelete ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Delete product"
                  disabled={isSaving}
                  className="h-12 items-center justify-center rounded-2xl bg-[rgba(106,51,66,0.1)]"
                  onPress={onDelete}
                >
                  <Text className="font-body-medium font-bold text-[#6a3342] text-sm">
                    Delete Product
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function InventoryField(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  containerClassName?: string;
}) {
  const {
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    autoCapitalize = "sentences",
    containerClassName,
  } = props;

  return (
    <View className={containerClassName}>
      <Text className="mb-1.5 text-[10px] font-label font-bold uppercase tracking-[0.16em] text-[#8e8e93]">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8e8e93"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className="h-12 rounded-2xl px-4 text-sm font-body bg-[rgba(255,255,255,0.82)] text-[#1c1c1e] font-semibold"
      />
    </View>
  );
}

function InventoryImagePicker(props: {
  imageUri: string;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onRemoveImage: () => void;
}) {
  const { imageUri, onPickImage, onTakePhoto, onRemoveImage } = props;

  return (
    <View>
      <Text className="mb-1.5 text-[10px] font-label font-bold uppercase tracking-[0.16em] text-[#8e8e93]">
        Product image
      </Text>
      <View className="rounded-2xl p-3 bg-[rgba(255,255,255,0.82)]">
        <View className="flex-row items-center gap-3">
          <View className="h-16 w-16 rounded-xl overflow-hidden shrink-0 bg-[rgba(0,0,0,0.03)]">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 64, height: 64 }}
                contentFit="cover"
              />
            ) : (
              <View className="h-16 w-16 items-center justify-center">
                <AppIcon
                  name="inventory_2"
                  size={24}
                  color="#8e8e93"
                  strokeWidth={1.8}
                />
              </View>
            )}
          </View>

          <View className="flex-1 gap-2">
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose product image from gallery"
                className="h-10 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[rgba(27,67,50,0.1)]"
                onPress={onPickImage}
              >
                <AppIcon
                  name="photo_library"
                  size={16}
                  color="#1b4332"
                  strokeWidth={2.4}
                />
                <Text className="font-body-medium font-bold text-[#1b4332] text-xs">
                  Gallery
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Take product photo"
                className="h-10 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[rgba(27,67,50,0.1)]"
                onPress={onTakePhoto}
              >
                <AppIcon
                  name="photo_camera"
                  size={16}
                  color="#1b4332"
                  strokeWidth={2.4}
                />
                <Text className="font-body-medium font-bold text-[#1b4332] text-xs">
                  Camera
                </Text>
              </Pressable>
            </View>

            {imageUri ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove product image"
                className="h-9 items-center justify-center rounded-xl bg-[rgba(106,51,66,0.1)]"
                onPress={onRemoveImage}
              >
                <Text className="font-body-medium font-bold text-[#6a3342] text-xs">
                  Remove Image
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

function formFromItem(item: InventoryItem): InventoryFormState {
  return {
    name: item.name,
    category: item.category,
    unit: item.unit,
    storePrice: String(item.storePrice),
    buyPrice: String(item.buyPrice),
    quantityOnHand: String(item.available),
    lowStockThreshold: String(item.lowStockThreshold),
    imageUrl: item.imageUrl,
  };
}

function formToMutationInput(
  form: InventoryFormState
): InventoryProductFormInput {
  return {
    name: form.name,
    categoryName: form.category,
    unit: form.unit,
    storePrice: parseDecimalField(form.storePrice, "Store price"),
    buyPrice: parseDecimalField(form.buyPrice || "0", "Buy price"),
    quantityOnHand: parseDecimalField(form.quantityOnHand || "0", "Stock"),
    lowStockThreshold: parseDecimalField(
      form.lowStockThreshold || "0",
      "Low alert"
    ),
    imageUrl: form.imageUrl,
  };
}

function parseDecimalField(value: string, label: string): number {
  const parsed = Number(value.replace(/,/g, "").trim());
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a valid number.`);
  }
  return parsed;
}
