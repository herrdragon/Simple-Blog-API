const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { Validator, ValidationError } = require("express-json-validator-middleware");

app.use(bodyParser.json());
app.use(cors());

const { validate } = new Validator();
var blog = []
var bid = 0
var cid = 0
var logged = false

const postSchema = {
	type: "object",
	required: ["title", "author", "content"],
	properties: {
		title: {
			type: "string",
			minLength: 2,
		},
        author: {
			type: "string",
			minLength: 2,
		},
		content: {
			type: "string",
			minLength: 5,
		}
	},
};
const commentSchema = {
	type: "object",
	required: ["author", "comments"],
	properties: {
        author: {
			type: "string",
			minLength: 2,
		},
		comments: {
			type: "string",
			minLength: 2,
		}
	},
};
const replySchema = {
	type: "object",
	required: ["author", "comment", "reply"],
	properties: {
        author: {
			type: "string",
			minLength: 2,
		},
		comment: {
			type: "string",
			minLength: 2,
		},
        reply: {
			type: "string",
			minLength: 2,
		}
	},
};
const editSchema = {
	type: "object",
	required: ["content"],
	properties: {
		content: {
			type: "string",
			minLength: 2,
		}
	},
};
const loginSchema = {
	type: "object",
	required: ["user", "pass"],
	properties: {
		user: {
			type: "string",
			minLength: 2,
		},
        pass: {
			type: "string",
			minLength: 2,
		}
	},
};
// Send erros back if schema is invalid
const validationErrorMiddleware = (error, request, response, next) => {
	if (response.headersSent) {
		return next(error);
	}

	const isValidationError = error instanceof ValidationError;
	if (!isValidationError) {
		return next(error);
	}

	response.status(400).json({
		errors: error.validationErrors,
	});

	next();
}
// Recursively search for a comment to reply
const insertReply = (jsonObj, obj) => {
    if( jsonObj !== null && typeof jsonObj == "object") {
        for(var key in jsonObj) {
            if(key == "comment") {
                if(jsonObj[key] == obj.comment) {
                    jsonObj.reply.push({id: cid, author:obj.author, comment:obj.reply, reply:[]});
                    cid++;
                    break;
                }
                else {
                    for(let i = 0; i < jsonObj.reply.length; i++) {
                        insertReply(jsonObj.reply[i], obj);
                    }
                }
            }
        };
        return;
    }
}
// Recursively search for a comment to update
const editComment = (commArr, id, content) => {
    if(commArr.length) {
        for(let i = 0; i < commArr.length; i++) {
            if(commArr[i].id == id) {
                commArr[i].comment = content;
                break;
            }
            else {
                for(let j = 0; j < commArr[i].reply.length; j++) {
                    editComment(commArr[i].reply, id, content);
                }
            }
        }
        return;
    }
}
// Recursively search for a comment to delete
const deleteComment = (commArr, id) => {
    if(commArr.length) {
        for(let i = 0; i < commArr.length; i++) {
            if(commArr[i].id == id) {
                commArr.splice(i, 1);
                break;
            }
            else {
                for(let j = 0; j < commArr[i].reply.length; j++) {
                    deleteComment(commArr[i].reply, id);
                }
            }
        }
        return;
    }
}
// Check user is logged
const login = (req, res, next) => {
    if(!logged)
       return res.status(401).send("Login first")
    next();
}
// Test server
app.get("/", (req, res) => {
    res.json("Nothig to see here, move along...");
});
// Login to system
app.post("/login", validate({ body: loginSchema }), (req, res) => {
    if(logged == false) logged = true
    res.json("Login success");
});
// Publish a blog post
app.post("/post", login, validate({ body: postSchema }), (req, res) => {
    blog.push({id:bid,title:req.body.title, author:req.body.author, content:req.body.content, timestamp:new Date(), comments:[]});
    for(let i = 0; i < blog.length; i++) {
        if(blog[i].id == bid)
            res.json(blog[i]);
    }
    bid++;
});
// Comment on a post
app.post("/post/:id/comments", login, validate({ body: commentSchema }), (req, res) => {
    let id = parseInt(req.params.id);
    for(let i = 0; i < blog.length; i++) {
        if(blog[i].id == id) {
            blog[i].comments.push({id: cid, comment:req.body.comments, reply:[]});
            cid++;
        }
    }
    res.json(blog[id]);
});
// Reply to a comment on a post
app.post("/post/:id/comment/reply", login, validate({ body: replySchema }), (req, res) => {
    let id = parseInt(req.params.id);
    for(let i = 0; i < blog.length; i++) {
        if(blog[i].id == id) {
            for(let j = 0; j < blog[i].comments.length; j++) {
                insertReply(blog[i].comments[j], req.body);
            }
        }
    }
    res.json(blog[id]);
});
// Edit a post
app.put("/post", login, (req, res) => {
    for(let i = 0; i < blog.length; i++) {
        if(blog[i].id == req.body.id) {
            blog[i].content = req.body.content
            return res.json(blog[i]);
        }   
    }
    res.status(404).send("Something missing...")
});
// Edit comment
app.put("/post/:pid/comment/:id", login, validate({ body: editSchema }), (req, res) => {
    let pid = parseInt(req.params.pid);
    let id = parseInt(req.params.id);
    for(let i = 0; i < blog.length; i++) {
        if(blog[i].id == pid) {
            editComment(blog[i].comments, id, req.body.content);
            return res.json(blog[i]);
        }
    }
    res.status(404).send("Something missing...")
});
// Retrieve all blog posts
app.get("/posts", login, (req, res) => {
    res.json(blog);
});
// Retrieve one blog post
app.get("/post/:id", login, (req, res) => {
    let id = parseInt(req.params.id);
    for(let i = 0; i < blog.length; i++) {
        if(blog[i].id == id)
            return res.json(blog[i]);
    }
    res.status(404).send("Something missing...")
});
// Delete one blog post and all the comments
app.delete("/post/:id", login, (req, res) => {
    let id = parseInt(req.params.id);
    if(blog.length < 1) return res.status(404).send("Something missing...")
    for(let i = 0; i < blog.length; i++) {
        if(blog[i].id == id) {
            blog.splice(i, 1);
            return res.json(req.params.id);
        }
    }
    res.status(404).send("Something missing...")
});
// Delete one comment and all replies
app.delete("/post/:pid/comment/:id", login, (req, res) => {
    let pid = parseInt(req.params.pid);
    let id = parseInt(req.params.id);
    for(let i = 0; i < blog.length; i++) {
        if(blog[i].id == pid) {
            deleteComment(blog[i].comments, id);
            return res.json(req.params.id);
        }
    }
    res.status(404).send("Something missing...")
});
// Start the server
app.use(validationErrorMiddleware);
app.listen(3000, () => {
 console.log("Server running on port 3000");
});