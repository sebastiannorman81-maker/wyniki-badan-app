import { useState, useEffect, useCallback } from 'react';
import { TestParameter, TestResult } from '../types';
import { loadParameters, saveParameters, loadResults, saveResults } from '../utils/storage';
import { updateAndroidWidgets } from '../utils/widgets';

export function useTestData() {
  const [parameters, setParameters] = useState<TestParameter[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    (async () => {
      const [params, res] = await Promise.all([loadParameters(), loadResults()]);
      setParameters(params);
      setResults(res);
      setLoading(false);
      // Update widgets on startup to ensure sync
      updateAndroidWidgets();
    })();
  }, []);

  // ========================
  // Parameter CRUD
  // ========================

  const addParameter = useCallback(async (param: TestParameter) => {
    const updated = [...parameters, param];
    setParameters(updated);
    await saveParameters(updated);
    updateAndroidWidgets();
  }, [parameters]);

  const updateParameter = useCallback(async (oldName: string, param: TestParameter) => {
    const updatedParams = parameters.map(p => p.name === oldName ? param : p);
    let updatedResults = results;

    if (oldName !== param.name) {
      updatedResults = results.map(r =>
        r.parameter === oldName
          ? { ...r, parameter: param.name, unit: param.unit, referenceRange: param.referenceRange, category: param.category }
          : r
      );
    } else {
      updatedResults = results.map(r =>
        r.parameter === oldName
          ? { ...r, unit: param.unit, referenceRange: param.referenceRange, category: param.category }
          : r
      );
    }

    setParameters(updatedParams);
    setResults(updatedResults);
    await Promise.all([saveParameters(updatedParams), saveResults(updatedResults)]);
    updateAndroidWidgets();
  }, [parameters, results]);

  const deleteParameter = useCallback(async (name: string) => {
    const updatedParams = parameters.filter(p => p.name !== name);
    const updatedResults = results.filter(r => r.parameter !== name);
    setParameters(updatedParams);
    setResults(updatedResults);
    await Promise.all([saveParameters(updatedParams), saveResults(updatedResults)]);
    updateAndroidWidgets();
  }, [parameters, results]);

  const reorderParameters = useCallback(async (fromIndex: number, toIndex: number) => {
    const updated = [...parameters];
    const [removed] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, removed);
    setParameters(updated);
    await saveParameters(updated);
    updateAndroidWidgets();
  }, [parameters]);

  // ========================
  // Result CRUD
  // ========================

  const addResult = useCallback(async (result: TestResult) => {
    const updated = [...results, result];
    setResults(updated);
    await saveResults(updated);
    updateAndroidWidgets();
  }, [results]);

  const addResults = useCallback(async (newResults: TestResult[]) => {
    const updated = [...results, ...newResults];
    setResults(updated);
    await saveResults(updated);
    updateAndroidWidgets();
  }, [results]);

  const updateResult = useCallback(async (id: string, updates: Partial<TestResult>) => {
    const updated = results.map(r => r.id === id ? { ...r, ...updates } : r);
    setResults(updated);
    await saveResults(updated);
    updateAndroidWidgets();
  }, [results]);

  const deleteResult = useCallback(async (id: string) => {
    const updated = results.filter(r => r.id !== id);
    setResults(updated);
    await saveResults(updated);
    updateAndroidWidgets();
  }, [results]);

  // ========================
  // Helpers
  // ========================

  const getResultsForParam = useCallback((paramName: string) => {
    return results
      .filter(r => r.parameter === paramName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [results]);

  const getLatestResult = useCallback((paramName: string) => {
    const paramResults = getResultsForParam(paramName);
    return paramResults.length > 0 ? paramResults[0] : null;
  }, [getResultsForParam]);

  // Bulk replace (for import)
  const replaceAll = useCallback(async (params: TestParameter[], res: TestResult[]) => {
    setParameters(params);
    setResults(res);
    await Promise.all([saveParameters(params), saveResults(res)]);
    updateAndroidWidgets();
  }, []);

  return {
    parameters,
    results,
    loading,
    addParameter,
    updateParameter,
    deleteParameter,
    reorderParameters,
    addResult,
    addResults,
    updateResult,
    deleteResult,
    getResultsForParam,
    getLatestResult,
    replaceAll,
  };
}
