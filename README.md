# Simple-Blog-API
Basic CRUD operations, basic auth, json validation schema for POST.

To try it
1. Clone this repo
2. cd into folder
3. run npm install
4. run node index.js

Endpoints:
```
Post:/login
Sample:login
{
    "user": "pepo",
    "pass": "hhmm"
}
```
```
Post:/post
Sample:blogging
{
    "title":"My first post",
    "author":"me the author",
    "content":"posting posting 123"
}
```
```
Post:/post/:id/comments
Sample:comment a post
{
    "author":"another me",
    "comments": "check check"
}
```
```
Post:/post/:id/comment/reply
Sample:reply to a comment
{
    "author":"me again",
    "comment": "check check",
    "reply": "uno dos"
}
```
```
Put:/post
Sample:edit a post
{
    "id": 0,
    "title": "My first post",
    "author": "me the author",
    "content": "ok bye bye",
    "timestamp": "2022-02-13T03:13:04.836Z",
    "comments": []
}
```
```
Put:/post/:pid/comment/:id
Sample:edit a comment
{
    "content":"oh yeah"
}
```
```
Get:/posts
Sample:retrieve all posts
```
```
Get:/post/:id
Sample:retrieve one post
```
```
Delete:/post/:id
Sample:delete one post
```
```
Delete:/post/:id/comment/:id
Sample:delete one comment
```

You can also import Blog.postman_collection.json into POSTMAN as a collection. It contains already some data so you can use the runner to test all endpoints. They all should give 200 ok. THe runner sequence should be: Login, Post, CommentPost, ReplyComment, EditPost, EditComment, GetPosts, GetOnePost, DeleteComment, DeletePost.
For better results, test runner first thing after starting the server.
