import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  Printer,
  PrinterStatus,
  PrintJob,
  PrintJobStatus,
  PrinterSettings,
} from '../../types';
import {ApiResponse} from '../../types';
import {API_ENDPOINTS} from '../../constants';
import {apiService} from '../../services/api';

// 비동기 액션 생성
export const fetchPrinters = createAsyncThunk(
  'printer/fetchAll',
  async (_, {rejectWithValue}) => {
    try {
      const response = await apiService.get<ApiResponse<Printer[]>>(
        API_ENDPOINTS.PRINTER.STATUS,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '프린터 목록을 가져올 수 없습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '프린터 목록을 가져오는 중 오류가 발생했습니다.',
      );
    }
  },
);

export const connectToPrinter = createAsyncThunk(
  'printer/connect',
  async (printerId: string, {rejectWithValue}) => {
    try {
      const response = await apiService.post<ApiResponse<Printer>>(
        `${API_ENDPOINTS.PRINTER.STATUS}/${printerId}/connect`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '프린터 연결에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '프린터 연결 중 오류가 발생했습니다.',
      );
    }
  },
);

export const disconnectFromPrinter = createAsyncThunk(
  'printer/disconnect',
  async (printerId: string, {rejectWithValue}) => {
    try {
      const response = await apiService.post<ApiResponse<boolean>>(
        `${API_ENDPOINTS.PRINTER.STATUS}/${printerId}/disconnect`,
      );

      if (response.data.success) {
        return printerId;
      } else {
        return rejectWithValue(
          response.data.message || '프린터 연결 해제에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '프린터 연결 해제 중 오류가 발생했습니다.',
      );
    }
  },
);

export const sendPrintJob = createAsyncThunk(
  'printer/print',
  async (
    {
      printerId,
      photoId,
      printSettings,
    }: {printerId: string; photoId: string; printSettings: any},
    {rejectWithValue},
  ) => {
    try {
      const response = await apiService.post<ApiResponse<PrintJob>>(
        API_ENDPOINTS.PRINTER.PRINT,
        {printerId, photoId, printSettings},
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '프린트 작업 전송에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '프린트 작업 전송 중 오류가 발생했습니다.',
      );
    }
  },
);

export const fetchPrintQueue = createAsyncThunk(
  'printer/fetchQueue',
  async (printerId: string, {rejectWithValue}) => {
    try {
      const response = await apiService.get<ApiResponse<PrintJob[]>>(
        `${API_ENDPOINTS.PRINTER.QUEUE}/${printerId}`,
      );

      if (response.data.success && response.data.data) {
        return {printerId, jobs: response.data.data};
      } else {
        return rejectWithValue(
          response.data.message || '프린트 큐를 가져올 수 없습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '프린트 큐를 가져오는 중 오류가 발생했습니다.',
      );
    }
  },
);

export const cancelPrintJob = createAsyncThunk(
  'printer/cancelJob',
  async (
    {printerId, jobId}: {printerId: string; jobId: string},
    {rejectWithValue},
  ) => {
    try {
      const response = await apiService.delete<ApiResponse<boolean>>(
        `${API_ENDPOINTS.PRINTER.QUEUE}/${printerId}/jobs/${jobId}`,
      );

      if (response.data.success) {
        return {printerId, jobId};
      } else {
        return rejectWithValue(
          response.data.message || '프린트 작업 취소에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '프린트 작업 취소 중 오류가 발생했습니다.',
      );
    }
  },
);

export const updatePrinterSettings = createAsyncThunk(
  'printer/updateSettings',
  async (
    {
      printerId,
      settings,
    }: {printerId: string; settings: Partial<PrinterSettings>},
    {rejectWithValue},
  ) => {
    try {
      const response = await apiService.put<ApiResponse<Printer>>(
        `${API_ENDPOINTS.PRINTER.SETTINGS}/${printerId}`,
        settings,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || '프린터 설정 업데이트에 실패했습니다.',
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || '프린터 설정 업데이트 중 오류가 발생했습니다.',
      );
    }
  },
);

// 초기 상태
const initialState = {
  printers: [] as Printer[],
  selectedPrinter: null as Printer | null,
  isConnected: false,
  isLoading: false,
  error: null as string | null,
  connectionStatus: 'disconnected' as
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'error',
  printJobs: [] as PrintJob[],
  currentJob: null as PrintJob | null,
  printerHealth: {
    isOnline: false,
    hasPaper: true,
    hasInk: true,
    errorCount: 0,
    lastMaintenance: null as Date | null,
  },
};

// 슬라이스 생성
const printerSlice = createSlice({
  name: 'printer',
  initialState,
  reducers: {
    // 선택된 프린터 설정
    setSelectedPrinter: (state, action: PayloadAction<Printer | null>) => {
      state.selectedPrinter = action.payload;
    },

    // 연결 상태 설정
    setConnectionStatus: (
      state,
      action: PayloadAction<typeof state.connectionStatus>,
    ) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
    },

    // 프린터 상태 업데이트
    updatePrinterStatus: (
      state,
      action: PayloadAction<{printerId: string; status: PrinterStatus}>,
    ) => {
      const {printerId, status} = action.payload;
      const printer = state.printers.find(p => p.id === printerId);
      if (printer) {
        printer.status = status;
      }
    },

    // 프린트 작업 상태 업데이트
    updatePrintJobStatus: (
      state,
      action: PayloadAction<{jobId: string; status: PrintJobStatus}>,
    ) => {
      const {jobId, status} = action.payload;
      const job = state.printJobs.find(j => j.id === jobId);
      if (job) {
        job.status = status;
      }

      if (state.currentJob?.id === jobId) {
        state.currentJob.status = status;
      }
    },

    // 프린터 건강 상태 업데이트
    updatePrinterHealth: (
      state,
      action: PayloadAction<Partial<typeof state.printerHealth>>,
    ) => {
      state.printerHealth = {...state.printerHealth, ...action.payload};
    },

    // 로딩 상태 설정
    setPrinterLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 에러 상태 설정
    setPrinterError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 프린터 상태 초기화
    clearPrinterState: state => {
      state.selectedPrinter = null;
      state.isConnected = false;
      state.connectionStatus = 'disconnected';
      state.printJobs = [];
      state.currentJob = null;
      state.printerHealth = {
        isOnline: false,
        hasPaper: true,
        hasInk: true,
        errorCount: 0,
        lastMaintenance: null,
      };
    },

    // 프린트 작업 추가
    addPrintJob: (state, action: PayloadAction<PrintJob>) => {
      state.printJobs.unshift(action.payload);
    },

    // 프린트 작업 제거
    removePrintJob: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      state.printJobs = state.printJobs.filter(job => job.id !== jobId);

      if (state.currentJob?.id === jobId) {
        state.currentJob = null;
      }
    },

    // 현재 작업 설정
    setCurrentJob: (state, action: PayloadAction<PrintJob | null>) => {
      state.currentJob = action.payload;
    },
  },

  // 비동기 액션 처리
  extraReducers: builder => {
    // 전체 프린터 가져오기
    builder
      .addCase(fetchPrinters.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrinters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.printers = action.payload;
        state.error = null;
      })
      .addCase(fetchPrinters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 프린터 연결
    builder
      .addCase(connectToPrinter.pending, state => {
        state.isLoading = true;
        state.connectionStatus = 'connecting';
        state.error = null;
      })
      .addCase(connectToPrinter.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connectionStatus = 'connected';
        state.isConnected = true;
        state.selectedPrinter = action.payload;
        state.error = null;
      })
      .addCase(connectToPrinter.rejected, (state, action) => {
        state.isLoading = false;
        state.connectionStatus = 'error';
        state.isConnected = false;
        state.error = action.payload as string;
      });

    // 프린터 연결 해제
    builder
      .addCase(disconnectFromPrinter.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disconnectFromPrinter.fulfilled, (state, _action) => {
        state.isLoading = false;
        state.connectionStatus = 'disconnected';
        state.isConnected = false;
        state.selectedPrinter = null;
        state.error = null;
      })
      .addCase(disconnectFromPrinter.rejected, (state, _action) => {
        state.isLoading = false;
        state.error = _action.payload as string;
      });

    // 프린트 작업 전송
    builder
      .addCase(sendPrintJob.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendPrintJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.printJobs.unshift(action.payload);
        state.currentJob = action.payload;
        state.error = null;
      })
      .addCase(sendPrintJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 프린트 큐 가져오기
    builder
      .addCase(fetchPrintQueue.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrintQueue.fulfilled, (state, action) => {
        state.isLoading = false;
        const {jobs} = action.payload;
        state.printJobs = jobs;

        // 현재 작업 찾기
        const currentJob = jobs.find(job => job.status === 'printing');
        state.currentJob = currentJob || null;

        state.error = null;
      })
      .addCase(fetchPrintQueue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 프린트 작업 취소
    builder
      .addCase(cancelPrintJob.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelPrintJob.fulfilled, (state, action) => {
        state.isLoading = false;
        const {jobId} = action.payload;

        // 작업 상태를 취소됨으로 변경
        const job = state.printJobs.find(j => j.id === jobId);
        if (job) {
          job.status = PrintJobStatus.CANCELLED;
        }

        if (state.currentJob?.id === jobId) {
          state.currentJob.status = PrintJobStatus.CANCELLED;
        }

        state.error = null;
      })
      .addCase(cancelPrintJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 프린터 설정 업데이트
    builder
      .addCase(updatePrinterSettings.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePrinterSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedPrinter = action.payload;

        // 프린터 목록 업데이트
        const index = state.printers.findIndex(p => p.id === updatedPrinter.id);
        if (index !== -1) {
          state.printers[index] = updatedPrinter;
        }

        // 선택된 프린터 업데이트
        if (state.selectedPrinter?.id === updatedPrinter.id) {
          state.selectedPrinter = updatedPrinter;
        }

        state.error = null;
      })
      .addCase(updatePrinterSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 액션 내보내기
export const {
  setSelectedPrinter,
  setConnectionStatus,
  updatePrinterStatus,
  updatePrintJobStatus,
  updatePrinterHealth,
  setPrinterLoading,
  setPrinterError,
  clearPrinterState,
  addPrintJob,
  removePrintJob,
  setCurrentJob,
} = printerSlice.actions;

// 리듀서 내보내기
export default printerSlice.reducer;

// 선택자 함수들
export const selectPrinters = (state: {printer: typeof initialState}) =>
  state.printer.printers;
export const selectSelectedPrinter = (state: {printer: typeof initialState}) =>
  state.printer.selectedPrinter;
export const selectPrinterConnected = (state: {printer: typeof initialState}) =>
  state.printer.isConnected;
export const selectPrinterLoading = (state: {printer: typeof initialState}) =>
  state.printer.isLoading;
export const selectPrinterError = (state: {printer: typeof initialState}) =>
  state.printer.error;
export const selectConnectionStatus = (state: {printer: typeof initialState}) =>
  state.printer.connectionStatus;
export const selectPrintJobs = (state: {printer: typeof initialState}) =>
  state.printer.printJobs;
export const selectCurrentJob = (state: {printer: typeof initialState}) =>
  state.printer.currentJob;
export const selectPrinterHealth = (state: {printer: typeof initialState}) =>
  state.printer.printerHealth;

// 온라인 프린터만 선택
export const selectOnlinePrinters = (state: {printer: typeof initialState}) =>
  state.printer.printers.filter(printer => printer.status === 'online');

// 사용 가능한 프린터 선택 (온라인이고 용지/잉크가 있는)
export const selectAvailablePrinters = (state: {
  printer: typeof initialState;
}) =>
  state.printer.printers.filter(
    printer =>
      printer.status === 'online' &&
      state.printer.printerHealth.isOnline &&
      state.printer.printerHealth.hasPaper &&
      state.printer.printerHealth.hasInk,
  );

// 활성 프린트 작업 선택
export const selectActivePrintJobs = (state: {printer: typeof initialState}) =>
  state.printer.printJobs.filter(job =>
    ['queued', 'processing', 'printing'].includes(job.status),
  );

// 완료된 프린트 작업 선택
export const selectCompletedPrintJobs = (state: {
  printer: typeof initialState;
}) => state.printer.printJobs.filter(job => job.status === 'completed');

// 실패한 프린트 작업 선택
export const selectFailedPrintJobs = (state: {printer: typeof initialState}) =>
  state.printer.printJobs.filter(job => job.status === 'failed');
