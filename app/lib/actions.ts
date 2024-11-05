'use server';

import {  z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

//Use zod to update the expected types
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please Select a Custumer.',
    }),
    amount: z.coerce.number().gt(0, {message: 'Please enter an amount greater than $0.'}),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select a status.',
    }), 
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true });
const UpdateInvoice = FormSchema.omit({id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
        name?: string[];
        email?: string[];
    };
    message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    // Validate form fields using zod
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    // If form validation fails, return errors early. Otherwise continue
    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    // Prepare data for insertion into the DB.
    const {customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // Insert data into the DB
    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
    } catch (error) {
        console.error('An Error ocured:', error);
        // If error, return a specific error message.
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    // Revallidate cache for the invoices page and rediret the user.
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

}

export async function updateInvoice(id: string, prevState: State, formdata: FormData) {
   const validatedFields = UpdateInvoice.safeParse({
    //id: formdata.get('id'),
    customerId: formdata.get('customerId'),
    amount: formdata.get('amount'),
    status: formdata.get('status'),
   });

   if(!validatedFields.success) {
    return {
        errors: validatedFields.error.flatten(),
        message: 'Missing Fields. Failed to Update Invoice.',
    };
   }

    const {customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}`;
    } catch(error) {
        console.error('An Error ocured:', error);
        return {
            message: 'Database Error: Failed to Update Invoice.',
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return {message: 'Deleted Invoice.'};
  } catch(error) {
    console.error('An Error ocured:', error);
    return { message: 'Database Error: Failed to Delete Invoices.'};
  }
  }

  
  // Form Schema for the add customer form 
const AddCustomerSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid Email.'),
    image_url: z.string().default('https://i.pravatar.cc/300'),
})



  export async function createCustomer(state: State, formData: FormData) {
     
    const validatedFields = AddCustomerSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        image_url: formData.get('image_url') ||'https://i.pravatar.cc/300',
    });

    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Add Customer.',
        };
    }

    const {name, email, image_url} = validatedFields.data;
    //const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
        INSERT INTO customers (name, email, image_url) 
        VALUES (${name}, ${email}, ${image_url})`;

        redirect('/dashboard/customers');
        revalidatePath('/dashboard/customers');
    } catch (error) {
        console.error('An Error ocured:', error);
        return {
            message: 'Data Base Error. Failed to Add Customer.'
        };
    }
  };

  export async function authenticate (
    prevState: string | undefined ,
    formData: FormData,
  ) {
    try {
        await signIn ('credentials', formData);
    } catch (error) {
        if(error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                    default:
                        return 'Something went wrong.';
            }
        }
        throw error;
        }
    }
  