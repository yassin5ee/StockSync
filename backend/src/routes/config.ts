import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  res.json({ success: true, data: {
    lowStockThreshold: 50,
    performanceAlertThreshold: 90,
    autoReorder: true,
    transferAutoApprove: false,
    integrationEcommerce: ['Shopify','WooCommerce','PrestaShop'],
    backupFrequency: 'daily'
  }});
});

router.put('/', async (req: Request, res: Response) => {
  res.json({ success: true, data: req.body });
});

export default router;
