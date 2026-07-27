/// <reference types="react-native-css-interop/types" />

import "react-native";

declare module "react-native" {
  interface PressableProps {
    className?: string;
    cssInterop?: boolean;
  }

  interface TextInputProps {
    className?: string;
    cssInterop?: boolean;
  }
}

declare module "react-native/Libraries/Components/View/ViewPropTypes" {
  interface ViewProps {
    className?: string;
    cssInterop?: boolean;
  }
}

declare module "react-native/Libraries/Text/Text" {
  interface TextProps {
    className?: string;
    cssInterop?: boolean;
  }
}

declare module "react-native/Libraries/Components/ScrollView/ScrollView" {
  interface ScrollViewProps {
    className?: string;
    contentContainerClassName?: string;
    cssInterop?: boolean;
    indicatorClassName?: string;
  }
}

declare module "react-native/Libraries/Components/Pressable/Pressable" {
  interface PressableProps {
    className?: string;
    cssInterop?: boolean;
  }
}

declare module "react-native/Libraries/Components/TextInput/TextInput" {
  interface TextInputProps {
    className?: string;
    cssInterop?: boolean;
    placeholderClassName?: string;
  }
}

declare module "react-native/Libraries/Image/Image" {
  interface ImagePropsBase {
    className?: string;
    cssInterop?: boolean;
  }
}
