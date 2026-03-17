from odoo import Command
from odoo.tests import tagged
from odoo.tests.common import TransactionCase


@tagged('post_install', '-at_install')
class TestKpiProvider(TransactionCase):

    def test_kpi_summary(self):
        # Clean things for the test
        self.env['documents.document'].search([]).unlink()
        self.assertCountEqual(self.env['kpi.provider'].get_documents_kpi_summary(),
                              [{'id': 'documents.inbox', 'name': 'Inbox', 'type': 'integer', 'value': 0}])

        all_documents = self.env['documents.document'].create([{
            'folder_id': self.ref('documents.documents_internal_folder'),
            'tag_ids': self.env.ref('documents.documents_internal_status_inbox').ids,
        }] * 2)
        self.assertCountEqual(self.env['kpi.provider'].get_documents_kpi_summary(),
                              [{'id': 'documents.inbox', 'name': 'Inbox', 'type': 'integer', 'value': 2}])

        all_documents[0].tag_ids = [Command.clear()]
        self.assertCountEqual(self.env['kpi.provider'].get_documents_kpi_summary(),
                              [{'id': 'documents.inbox', 'name': 'Inbox', 'type': 'integer', 'value': 1}])

        self.env.ref('documents.documents_internal_status_inbox').unlink()
        self.assertCountEqual(self.env['kpi.provider'].get_documents_kpi_summary(), [])
