<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $contact = Contact::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'message' => $validated['message'],
        ]);

        return response()->json([
            'message' => 'Your message has been sent successfully.',
            'contact' => $contact,
        ], 201);
    }


    public function index()
    {
        $contacts = Contact::with('user')
            ->latest()
            ->get();

        return response()->json($contacts);
    }


    public function show(Contact $contact)
    {
        if (!$contact->read_at) {
            $contact->update(['read_at' => now()]);
        }

        $contact->load('user');

        return response()->json($contact);
    }


    public function destroy(Contact $contact)
    {
        $contact->delete();

        return response()->json([
            'message' => 'Contact message deleted successfully.',
        ]);
    }
}
