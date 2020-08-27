import React from "react";
import { ModelFilter, Model } from "react3l/core";
import { Filter } from "react3l-advanced-filters/Filter";
import { debounce } from "react3l/helpers";
import { DEBOUNCE_TIME_300 } from "react3l/config";
import { Moment } from "moment";
import { DateFilter } from "react3l-advanced-filters/DateFilter";
import { NumberFilter } from "react3l-advanced-filters/NumberFilter";
import nameof from "ts-nameof.macro";

export enum ActionFilterEnum {
  ChangeAllField,
  ChangeOneField,
  ChangeSkipTake,
  ChangeOrderType,
}

export interface AdvanceFilterAction<T1, T2> {
  type: ActionFilterEnum;
  data?: T1;
  fieldName?: keyof T1;
  fieldType?: keyof T2;
  fieldValue?: any;
  skip?: number;
  take?: number;
  orderBy?: string;
  orderType?: string;
}

export function advanceFilterReducer<T1 extends ModelFilter, T2 extends Filter>(
  state: T1,
  action: AdvanceFilterAction<T1, T2>,
) {
  switch (action.type) {
    case ActionFilterEnum.ChangeOneField:
      return {
        ...state,
        [action.fieldName]: {
          [action.fieldType]: action.fieldValue,
        },
      };
    case ActionFilterEnum.ChangeAllField:
      return action.data;
    case ActionFilterEnum.ChangeSkipTake:
      return {
        ...state,
        skip: action.skip,
        take: action.take,
      };
    case ActionFilterEnum.ChangeOrderType:
      return {
        ...state,
        orderBy: action.orderBy,
        orderType: action.orderType,
      };
  }
}

export const advanceFilterService = {
  useStringFilter<T1Filter extends ModelFilter, T2Filter extends Filter>(
    modelFilter: T1Filter,
    dispatch: (action: AdvanceFilterAction<T1Filter, T2Filter>) => void,
    fieldName: keyof T1Filter,
    fieldType: keyof T2Filter,
  ): [string, (value: string) => void] {
    const value = modelFilter[fieldName][fieldType];
    const handleChangeFilter = React.useCallback(
      debounce((value: string) => {
        dispatch({
          type: ActionFilterEnum.ChangeOneField,
          fieldName: fieldName,
          fieldType: fieldType,
          fieldValue: value,
        });
      }, DEBOUNCE_TIME_300),
      [dispatch, fieldName, fieldType],
    );

    return [value, handleChangeFilter];
  },

  useNumberFilter<T1Filter extends ModelFilter, T2Filter extends Filter>(
    modelFilter: T1Filter,
    dispatch: (action: AdvanceFilterAction<T1Filter, T2Filter>) => void,
    fieldName: keyof T1Filter,
    fieldType: keyof T2Filter,
  ): [number, (value: number) => void] {
    const value = modelFilter[fieldName][fieldType];
    const handleChangeFilter = React.useCallback(
      debounce((value: number) => {
        dispatch({
          type: ActionFilterEnum.ChangeOneField,
          fieldName: fieldName,
          fieldType: fieldType,
          fieldValue: value,
        });
      }, DEBOUNCE_TIME_300),
      [dispatch, fieldName, fieldType],
    );

    return [value, handleChangeFilter];
  },

  useNumberRangeFilter<T1Filter extends ModelFilter, T2Filter extends Filter>(
    modelFilter: T1Filter,
    dispatch: (action: AdvanceFilterAction<T1Filter, T2Filter>) => void,
    fieldName: keyof T1Filter,
  ): [[number, number], (numberRange: [number, number]) => void] {
    const valueFrom =
      modelFilter[fieldName][nameof(NumberFilter.prototype.greater)];
    const valueTo = modelFilter[fieldName][nameof(NumberFilter.prototype.less)];
    const value: [number, number] = [valueFrom, valueTo];
    const handleChangeNumberRange = React.useCallback(
      (numberRange: [number, number]) => {
        dispatch({
          type: ActionFilterEnum.ChangeAllField,
          data: {
            ...modelFilter,
            [fieldName]: {
              [nameof(NumberFilter.prototype.greater)]: numberRange[0],
              [nameof(NumberFilter.prototype.less)]: numberRange[1],
            },
          },
        });
      },
      [dispatch, fieldName, modelFilter],
    );
    return [value, handleChangeNumberRange];
  },

  useIdFilter<
    T1Filter extends ModelFilter,
    T2Filter extends Filter,
    T3 extends Model
  >(
    dispatch: (action: AdvanceFilterAction<T1Filter, T2Filter>) => void,
    fieldName: keyof T1Filter,
    fieldType: keyof T2Filter,
    model?: T3,
  ): [T3, (item: T3) => void] {
    const [item, setItem] = React.useState<T3>(model || null);
    const handleIdFilter = React.useCallback(
      (item: T3) => {
        const idValue = item?.id;
        dispatch({
          type: ActionFilterEnum.ChangeOneField,
          fieldName: fieldName,
          fieldType: fieldType,
          fieldValue: idValue || null,
        });
        setItem(item);
      },
      [dispatch, fieldName, fieldType],
    );
    return [item, handleIdFilter];
  },

  useDateFilter<T1Filter extends ModelFilter, T2Filter extends Filter>(
    modelFilter: T1Filter,
    dispatch: (action: AdvanceFilterAction<T1Filter, T2Filter>) => void,
    fieldName: keyof T1Filter,
    fieldType: keyof T2Filter,
  ): [Moment, (date: Moment) => void] {
    const value = modelFilter[fieldName][fieldType];
    const handleDateFilter = React.useCallback(
      (date: Moment) => {
        dispatch({
          type: ActionFilterEnum.ChangeOneField,
          fieldName: fieldName,
          fieldType: fieldType,
          fieldValue: date || null,
        });
      },
      [dispatch, fieldName, fieldType],
    );

    return [value, handleDateFilter];
  },

  useDateRangeFilter<T1Filter extends ModelFilter, T2Filter extends Filter>(
    modelFilter: T1Filter,
    dispatch: (action: AdvanceFilterAction<T1Filter, T2Filter>) => void,
    fieldName: keyof T1Filter,
  ): [[Moment, Moment], (dateRange: [Moment, Moment]) => void] {
    const valueFrom =
      modelFilter[fieldName][nameof(DateFilter.prototype.greater)] || null;
    const valueTo =
      modelFilter[fieldName][nameof(DateFilter.prototype.less)] || null;
    const value: [Moment, Moment] = [valueFrom, valueTo];
    const handleDateRangeFilter = React.useCallback(
      (dateRange: [Moment, Moment]) => {
        dispatch({
          type: ActionFilterEnum.ChangeAllField,
          data: {
            ...modelFilter,
            [fieldName]: {
              [nameof(DateFilter.prototype.greater)]: dateRange[0] || null,
              [nameof(DateFilter.prototype.less)]: dateRange[1] || null,
            },
          },
        });
      },
      [dispatch, fieldName, modelFilter],
    );
    return [value, handleDateRangeFilter];
  },
};
