export interface IRetrievalService {
  getContext(question: string, location?: { latitude: number; longitude: number }): Promise<string>;
}
