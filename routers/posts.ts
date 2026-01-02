import { initServer, RecursiveRouterObj } from '@ts-rest/express';
import { postsContract } from '../contract/posts'; // 引入子合約
import PostsService from '../services/posts.service'; // 引入 Service

const s = initServer();

export const postsRouter: RecursiveRouterObj<typeof postsContract> = s.router(postsContract, {
  create: async ({ body }) => {
    // 呼叫 Service
    const newPost = await PostsService.createPost(body);
    
    return {
      status: 201 as const,
      body: newPost,
    };
  },
  get: async ({ params }) => {
    const post = await PostsService.getPostById(params.id);
    
    if (!post) {
      return { status: 404 as const, body: { message: 'Not Found' } };
    }
    
    return { status: 200 as const, body: post };
  },
});