import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import subscriptionsRouter from "./subscriptions";
import telehealthRouter from "./telehealth";
import blogRouter from "./blog";
import usersRouter from "./users";
import dashboardRouter from "./dashboard";
import trackerRouter from "./tracker";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(subscriptionsRouter);
router.use(telehealthRouter);
router.use(blogRouter);
router.use(usersRouter);
router.use(dashboardRouter);
router.use(trackerRouter);
router.use(paymentsRouter);

export default router;
