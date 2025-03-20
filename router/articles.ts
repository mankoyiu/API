// articles.ts
import Router, { RouterContext } from 'koa-router';
import { CustomErrorMessageFunction, body, validationResults } from 'koa-req-validation';
import * as db from '../helpers/dbhelpers';
import { basicAuthMiddleWare } from '../controllers/authMiddleware';

const router: Router = new Router({ prefix: '/api/v1/articles' });

interface Article {
  uid: number; // Unique ID
  title: string;
  fullText: string;
  _id?: any; // Optional MongoDB ObjectId (if stored)
}

// Custom error message function for validations
const customErrorMsg: CustomErrorMessageFunction = (ctx: RouterContext, value: string) => {
  return `The body content is not correct.`;
};

// Validation rules for the article fields
const validatorName = [
  body("title")
    .isLength({ min: 5 })
    .withMessage(customErrorMsg)
    .build(),
  body("fullText")
    .isLength({ min: 5 })
    .withMessage(customErrorMsg)
    .build(),
];

// GET /api/v1/articles/ - Retrieve all articles (admin only)
const getAll = async (ctx: RouterContext, next: any) => {
  try {
    if (ctx.status !== 401) {
      if (ctx.state.user.username === 'admin') {
        const articles = await db.find('articles', {});
        ctx.body = articles;
      } else {
        ctx.status = 401;
        ctx.body = { msg: 'unauthorized' };
      }
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { msg: 'Internal server error' };
  }
  await next();
};

// GET /api/v1/articles/:id - Retrieve an article by its uid (instead of _id)
const getById = async (ctx: RouterContext, next: any) => {
  try {
    const uidParam = ctx.params.id;
    const uid = Number(uidParam);

    // Validate that the uid is a valid number
    if (isNaN(uid)) {
      ctx.status = 400; // Bad Request
      ctx.body = { msg: 'Invalid article UID format' };
      return;
    }

    // Search by uid instead of _id
    const articles = await db.find('articles', { uid: uid });
    if (articles && articles.length > 0) {
      ctx.body = articles[0];
    } else {
      ctx.status = 404;
      ctx.body = { msg: 'Article not found' };
    }
  } catch (err) {
    console.error('Error in getById:', err);
    ctx.status = 500;
    ctx.body = { msg: 'Internal server error' };
  }
  await next();
};

// POST /api/v1/articles/ - Create a new article with validation
const add = async (ctx: RouterContext, next: any) => {
  const validationResult = validationResults(ctx);
  if (validationResult.hasErrors()) {
    ctx.status = 422;
    ctx.body = { err: validationResult.mapped() };
  } else {
    try {
      const newArticle: Article = ctx.request.body as Article;
      // Get the highest used uid, then assign the next one
      const maxUid = await db.getMaxUid('articles');
      
      console.log('Max UID before adding new article:', maxUid);
      newArticle.uid = (maxUid || 0) + 1;
      console.log('Assigned UID for new article:', newArticle.uid);
      
      const result = await db.add('articles', newArticle);
      ctx.status = 201;
      ctx.body = { msg: 'New article added', article: newArticle };
    } catch (error) {
      console.error('Error adding article:', error);
      ctx.status = 500;
      ctx.body = { msg: 'Internal server error' };
    }
  }
  await next();
};

// PUT /api/v1/articles/:id - Update an article (partial updates allowed)
const updateArticle = async (ctx: RouterContext, next: any) => {
  const validationResult = validationResults(ctx);
  if (validationResult.hasErrors()) {
    ctx.status = 422;
    ctx.body = { err: validationResult.mapped() };
  } else {
    try {
      const uidParam = ctx.params.id;
      const uid = Number(uidParam);

      // Validate that the uid is a valid number
      if (isNaN(uid)) {
        ctx.status = 400; // Bad Request
        ctx.body = { msg: 'Invalid article UID format' };
        return;
      }

      const article: Partial<Article> = ctx.request.body as Partial<Article>;
      // Update by searching through uid. db.update can be modified to support queries if required
      // In this example, we assume that the document structure is unique by uid
      const articles = await db.find('articles', { uid: uid });
      if (!articles || articles.length === 0) {
        ctx.status = 404;
        ctx.body = { msg: 'Article not found' };
        return;
      }
      
      // Use the _id found from the article document for the update operation.
      const docId = articles[0]._id;
      const result = await db.update('articles', docId, article);

      if (result.modifiedCount > 0) {
        ctx.status = 200;
        ctx.body = { msg: `Article with UID ${uid} updated` };
      } else {
        ctx.status = 404;
        ctx.body = { msg: 'Article not found' };
      }
    } catch (err) {
      console.error('Error in updateArticle:', err);
      ctx.status = 500;
      ctx.body = { msg: 'Internal server error' };
    }
  }
  await next();
};

// DELETE /api/v1/articles/:id - Delete an article by its uid
const deleteArticle = async (ctx: RouterContext, next: any) => {
  try {
    const uidParam = ctx.params.id;
    const uid = Number(uidParam);

    // Validate that the uid is a valid number
    if (isNaN(uid)) {
      ctx.status = 400; // Bad Request
      ctx.body = { msg: 'Invalid article UID format' };
      return;
    }
    
    // Find the article first using uid
    const articles = await db.find('articles', { uid: uid });
    if (!articles || articles.length === 0) {
      ctx.status = 404;
      ctx.body = { msg: 'Article not found' };
      return;
    }

    // Use the _id for deletion as it's required by the db.remove function.
    const docId = articles[0]._id;
    const result = await db.remove('articles', docId);

    if (result.deletedCount > 0) {
      ctx.status = 200;
      ctx.body = { msg: 'Article deleted' };
    } else {
      ctx.status = 404;
      ctx.body = { msg: 'Article not found' };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { msg: 'Internal server error' };
  }
};

// Routes registration
router.get('/', basicAuthMiddleWare, getAll);
router.get('/:id', getById);
router.post('/', ...validatorName, add);
router.put('/:id', ...validatorName, updateArticle);
router.delete('/:id', deleteArticle);

export { router };