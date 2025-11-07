"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "../../server/trpc/client";
import { Address } from "../../types/interfaces";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type ModalProps = {
  type?: "create" | "edit";
  userId: string;
  address?: Address;
  refetch: () => void;
};

const ModalAddress = ({
  type = "create",
  address,
  userId,
  refetch,
}: ModalProps) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "Brasil",
    isDefault: false,
  });

  // Preencher formulário quando editar
  useEffect(() => {
    if (type === "edit" && address) {
      setFormData({
        zipCode: address.zipCode || "",
        street: address.street || "",
        number: address.number || "",
        complement: address.complement || "",
        neighborhood: address.neighborhood || "",
        city: address.city || "",
        state: address.state || "",
        country: address.country || "Brasil",
        isDefault: address.isDefault || false,
      });
    } else {
      // Reset para criação
      setFormData({
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        country: "Brasil",
        isDefault: false,
      });
    }
  }, [address, type, open]);

  // Mutations
  const mutationCreate = trpc.address.createAddress.useMutation({
    onSuccess: () => {
      toast.success("Novo endereço adicionado com sucesso");
      refetch();
      setOpen(false);
      setIsPending(false);
    },
    onError: (error) => {
      toast.error("Erro ao criar endereço");
      setError(error.message);
      setIsPending(false);
    },
  });

  const mutationUpdate = trpc.address.updateAddress.useMutation({
    onSuccess: () => {
      toast.success("Endereço atualizado com sucesso");
      refetch();
      setOpen(false);
      setIsPending(false);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar endereço");
      setError(error.message);
      setIsPending(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError("");

    try {
      if (type === "create") {
        await mutationCreate.mutateAsync({
          userId,
          ...formData,
        });
      } else if (type === "edit" && address) {
        await mutationUpdate.mutateAsync({
          id: address.id,
          ...formData,
        });
      }
    } catch (err) {
      console.error("Erro no formulário:", err);
      setIsPending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Buscar endereço pelo CEP (opcional)
  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanCEP}/json/`
        );
        const data = await response.json();

        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    setFormData((prev) => ({ ...prev, zipCode: cep }));

    // Buscar endereço automaticamente quando CEP estiver completo
    if (cep.length === 9 || cep.length === 8) {
      fetchAddressByCEP(cep);
    }
  };

  const disabledData = !formData.state || !formData.country || !formData.city;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-3xl"
        >
          {type === "create" ? "Novo Endereço" : "Editar Endereço"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {type === "create" ? "Adicionar Novo Endereço" : "Editar Endereço"}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? "Preencha os dados do novo endereço"
              : "Atualize os dados do endereço"}
          </DialogDescription>
        </DialogHeader>

        <div className="w-full h-full">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Linha 1: CEP e Logradouro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP *</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleCEPChange}
                  placeholder="00000-000"
                  required
                  maxLength={9}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street">Logradouro *</Label>
                <Input
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Rua, Avenida, etc."
                  required
                />
              </div>
            </div>

            {/* Linha 2: Número e Complemento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número *</Label>
                <Input
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  name="complement"
                  value={formData.complement}
                  onChange={handleInputChange}
                  placeholder="Apartamento, Bloco, etc."
                />
              </div>
            </div>

            {/* Linha 3: Bairro */}
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                placeholder="Bairro"
                required
              />
            </div>

            {/* Linha 4: Cidade e Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Cidade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="UF"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            {/* Linha 5: País e Checkbox */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">País *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isDefault" className="cursor-pointer">
                  Definir como endereço principal
                </Label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || disabledData}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {type === "create" ? "Criar Endereço" : "Atualizar Endereço"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalAddress;
