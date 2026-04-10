import { api } from './api';

/**
 * RAG Service for Stock AI Assistant
 * Handles all communication with the RAG endpoints
 */

interface AskResponse {
  answer: string;
}

interface HealthResponse {
  status: string;
  collection_count: number;
}

interface ReindexResponse {
  message: string;
}

/**
 * Ask a question about stock/inventory using RAG
 */
export const askStockQuestion = async (
  question: string,
  ownerId: string
): Promise<string> => {
  const response = await api.post<AskResponse>('/rag/ask', {
    question,
    owner_id: ownerId,
  });
  return response.data.answer;
};

/**
 * Trigger reindexing of the RAG vector store
 */
export const reindexStock = async (): Promise<string> => {
  const response = await api.post<ReindexResponse>('/rag/reindex', {});
  return response.data.message || 'Reindex completed successfully';
};

/**
 * Check RAG service health and collection count
 */
export const checkRAGHealth = async (): Promise<number> => {
  const response = await api.get<HealthResponse>('/rag/health');
  return response.data.collection_count;
};
