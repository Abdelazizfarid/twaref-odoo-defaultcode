# Part of Odoo. See LICENSE file for full copyright and licensing details.
import json

from odoo.tests import HttpCase, tagged


@tagged('post_install', '-at_install')
class TestStockBarcodeController(HttpCase):

    def test_search_barcode_for_package_type(self):
        self.authenticate('admin', 'admin')
        payload = json.dumps({
            'jsonrpc': '2.0',
            'method': 'call',
            'id': 0,
            'params': {
                'barcode': '9100000012345678',
                'model_name': 'stock.package.type',
            },
        })
        response = self.url_open(
            '/stock_barcode/get_specific_barcode_data',
            data=payload,
            headers={'Content-Type': 'application/json'},
        )
        self.assertNotIn("KeyError", response.text)
