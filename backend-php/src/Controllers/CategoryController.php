<?php

namespace App\Controllers;

use App\Auth;
use App\Models\CategoryModel;
use App\Support\Request;
use App\Support\Response;

class CategoryController
{
    /** GET /api/categories */
    public function index()
    {
        Response::json(CategoryModel::findActive());
    }

    /** GET /api/categories/:slug */
    public function show(string $slug)
    {
        $category = CategoryModel::findBySlug($slug, true);
        if (!$category) {
            Response::error('Category not found', 404);
        }
        Response::json(CategoryModel::toJson($category));
    }

    /** POST /api/categories (admin) */
    public function create()
    {
        Auth::requireAdmin();

        $name = Request::input('name');
        $slug = Request::input('slug');

        if (!$name || !$slug) {
            Response::error('Name and slug are required', 400);
        }

        $exists = CategoryModel::findBySlug($slug, false);
        if ($exists) {
            Response::error('A category with this slug already exists', 409);
        }

        $category = CategoryModel::create([
            'name' => $name,
            'slug' => $slug,
            'icon' => Request::input('icon'),
            'description' => Request::input('description'),
            'order' => Request::input('order', 0),
            'coverImageUrl' => Request::input('coverImageUrl'),
            'eventDate' => Request::input('eventDate'),
        ]);

        Response::json(CategoryModel::toJson($category), 201);
    }

    /** PUT /api/categories/:id (admin) */
    public function update(string $id)
    {
        Auth::requireAdmin();

        $category = CategoryModel::update($id, Request::all());
        if (!$category) {
            Response::error('Category not found', 404);
        }
        Response::json(CategoryModel::toJson($category));
    }

    /** DELETE /api/categories/:id (admin) — soft-delete (deactivates category) */
    public function destroy(string $id)
    {
        Auth::requireAdmin();
        CategoryModel::deactivate($id);
        Response::json(['message' => 'Category deactivated']);
    }
}
