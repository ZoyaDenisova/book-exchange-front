import * as React from 'react';

interface TabsProps {
  value: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  const [internalValue, setInternalValue] = React.useState(value);
  const actualValue = onValueChange ? value : internalValue;

  const contextValue = React.useMemo(() => ({
    value: actualValue,
    setValue: onValueChange || setInternalValue,
  }), [actualValue, onValueChange]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex border p-1 rounded-xl bg-muted ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children }) => {
  const { value: currentValue, setValue } = useTabs();

  const isActive = currentValue === value;

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={`px-4 py-2 text-sm rounded-xl transition-all ${
        isActive
          ? 'bg-white text-black shadow'
          : 'bg-transparent text-muted-foreground hover:bg-accent'
      }`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children }) => {
  const { value: currentValue } = useTabs();
  return currentValue === value ? <div className="mt-4">{children}</div> : null;
};

interface TabsContextType {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

const useTabs = () => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('Tabs component must be used inside <Tabs>');
  return context;
};
