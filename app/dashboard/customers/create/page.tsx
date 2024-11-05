import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import Form from '@/app/ui/customers/create-form' ; 


export default function Page() {
    

    return (
        <>
             <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          {
            label: 'Add Customer',
            href: '/dashboard/customers/create',
            active: true,
          },
        ]}
      />
            <Form />
        </>
    )
}