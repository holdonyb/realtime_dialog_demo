// 定义用户上下文接口
export interface UserContext {
  teacher_id: number | null;
  // 未来可能需要的其他用户信息
  user_name?: string;
  role?: 'teacher' | 'student' | 'admin';
}

// 创建一个用户上下文管理类
class UserContextManager {
  private static instance: UserContextManager;
  private context: UserContext = {
    teacher_id: null,
  };

  private constructor() {}

  public static getInstance(): UserContextManager {
    if (!UserContextManager.instance) {
      UserContextManager.instance = new UserContextManager();
    }
    return UserContextManager.instance;
  }

  // 设置用户上下文
  public setContext(newContext: Partial<UserContext>) {
    this.context = { ...this.context, ...newContext };
  }

  // 获取用户上下文
  public getContext(): UserContext {
    return this.context;
  }

  // 获取教师ID
  public getTeacherId(): number | null {
    return this.context.teacher_id;
  }

  // 清除上下文
  public clearContext() {
    this.context = {
      teacher_id: null,
    };
  }
}

export const userContext = UserContextManager.getInstance();

// 在开发环境中设置默认值（仅用于测试）
if (process.env.NODE_ENV === 'development') {
  userContext.setContext({
    teacher_id: 114,
  });
} 