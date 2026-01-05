// logic/posts.ts

export const PostsLogic = {
  async list({ page, limit }: { page: number; limit: number }) {
    console.log(`Fetching posts: page ${page}, limit ${limit}`);

    // 模擬資料庫查詢
    return [
      {
        id: '1',
        title: 'Hello oRPC',
        content: 'This is awesome',
        authorId: 1,
        createdAt: new Date(),
      },
    ];
  },

  async find({ id }: { id: string }) {
    // 模擬找不到的情況
    if (id === '999') {
      throw new Error('Post not found'); 
    }

    return {
      id: id,
      title: 'Found Post',
      content: 'Content here...',
      authorId: 1,
      createdAt: new Date(),
    };
  },

  async create(input: { title: string; content: string }, user?: { id: number }) {
    console.log('input:', input);
    // context user might be undefined if not logged in, handling it here
    const authorId = user?.id || 0; 
    console.log(`User ${authorId} creating post: ${input.title}`);
    
    // 模擬寫入資料庫
    return {
      id: 'new-id-123',
      title: input.title,
      content: input.content,
      authorId: authorId,
      createdAt: new Date(),
    };
  }
};
