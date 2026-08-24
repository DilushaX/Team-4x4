declare global {
  interface LayoutProps<T extends string = string> {
    children: React.ReactNode;
    params: Promise<Record<string, string>>;
  }
}

export {};
