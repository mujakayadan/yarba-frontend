import { useCallback, useState, useTransition } from 'react';

export function useDeferredTabs(initialIndex = 0) {
  const [tabValue, setTabValue] = useState(initialIndex);
  const [renderedTab, setRenderedTab] = useState(initialIndex);
  const [isTabPending, startTabTransition] = useTransition();

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    startTabTransition(() => {
      setRenderedTab(newValue);
    });
  }, []);

  return {
    tabValue,
    renderedTab,
    isTabPending,
    handleTabChange,
    setTabValue,
    setRenderedTab,
  };
}
