import React from 'react';
import { Search, Plus, Package, Edit3, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { formatFCFA } from '../../utils/security';

interface AdminProductsTabProps {
  products: Product[];
  productSearch: string;
  setProductSearch: (val: string) => void;
  handleOpenNewProduct: () => void;
  handleOpenEditProduct: (prod: Product) => void;
  handleDeleteProduct: (id: string) => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  productSearch,
  setProductSearch,
  handleOpenNewProduct,
  handleOpenEditProduct,
  handleDeleteProduct
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Filtrer par nom d'article, catégorie..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white focus:border-amber-500"
          />
        </div>

        <button
          id="btn-admin-add-product-main"
          onClick={handleOpenNewProduct}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Créer un nouvel article</span>
        </button>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Aucun article dans le catalogue
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Le catalogue est prêt pour vos ajouts. Créez vos premiers articles avec descriptions, prix en FCFA et plusieurs photos.
          </p>
          <button
            onClick={handleOpenNewProduct}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter mon premier article</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3.5">Photos</th>
                  <th className="p-3.5">Nom de l'article</th>
                  <th className="p-3.5">Catégorie</th>
                  <th className="p-3.5">Prix (FCFA)</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                      p.category.toLowerCase().includes(productSearch.toLowerCase())
                  )
                  .map((prod) => {
                    const mainImg = (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50">
                        <td className="p-3.5">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={mainImg} alt={prod.name} className="w-full h-full object-cover" />
                            {prod.images && prod.images.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-slate-900/80 text-amber-400 text-[9px] font-bold px-1 rounded-tl">
                                +{prod.images.length - 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 max-w-[200px]">
                          <span className="line-clamp-2">{prod.name}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-amber-50 text-amber-900 font-semibold px-2 py-0.5 rounded text-[11px]">
                            {prod.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-black text-slate-900">
                          {formatFCFA(prod.price)}
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="block text-[10px] text-slate-400 line-through">
                              {formatFCFA(prod.originalPrice)}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {prod.stock > 0 ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                              {prod.stock} en stock
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                              Épuisé
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500 max-w-[220px]">
                          <span className="line-clamp-2 text-[11px]">{prod.description}</span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Modifier l'article"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                              title="Supprimer l'article"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
