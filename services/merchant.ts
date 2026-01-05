const all = async (body: any) => {
    return {
        id: '1', // Schema 定義 id 為 string
        title: body.title,
        content: body.content,
        createdAt: Date.now(),
    };
}

const getPostById = async (id: string) => {
    return {
        id,
        title: 'Mock Post Title',
        content: 'This is mock content for post ' + id,
        createdAt: Date.now(),
    };
}

export default {
    all,
}