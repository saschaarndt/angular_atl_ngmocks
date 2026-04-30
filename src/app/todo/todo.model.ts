export interface TodoListModel {
  id: number;
  name: string;
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  listId: number;
}

export type FilterType = 'all' | 'active' | 'completed';
