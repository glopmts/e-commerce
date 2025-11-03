"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types/interfaces";
import { FormEventHandler, useState } from "react";
import NewsEmailUser from "../../../../components/user/modal-new-email";
import UploadImageUser from "../../../../components/user/user-upload-image";

type FormProps = {
  user: User;
  onSubmit: (formData: { name: string; email: string; image?: string }) => void;
  isLoading?: boolean;
};

type FormData = {
  name: string;
  email: string;
  image: string | null;
};

const FormProfile = ({ user, onSubmit, isLoading = false }: FormProps) => {
  const [form, setForm] = useState<FormData>({
    name: user.name || "",
    email: user.email!,
    image: user.image || "",
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      email: form.email,
      image: form.image || undefined,
    });
  };

  const handleImageChange = (imageUrl: string | null) => {
    handleChange("image", imageUrl || "");
  };

  const hasChanges =
    form.name !== user.name ||
    form.email !== user.email ||
    form.image !== user.image;

  function formatEmail(email: string) {
    if (!email) return "";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    const part = local.split(/[._+\-]/)[0] || local;
    const match = part.match(/^[A-Za-zÀ-ÖØ-öø-ÿ]+/);
    const firstName = match ? match[0] : part;
    return `${firstName}*****@${domain}`;
  }

  return (
    <div className="w-full h-full p-4">
      <div className="pb-4">
        <h1 className="text-xl font-semibold">Meu perfil</h1>
      </div>

      <div className="flex flex-col md:flex-row items-start flex-1 h-full gap-8">
        <form
          onSubmit={handleSubmit}
          className="w-full flex-1 flex flex-col gap-4"
        >
          <div className="flex items-center gap-1.5">
            <span>
              Nome usuário: <strong>{user.name || "User"}</strong>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              placeholder="Nome"
              id="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <span className="border p-2 rounded-md shadow text-zinc-400 bg-muted/50">
              {formatEmail(form.email)}
            </span>
            <div className="flex items-end justify-end">
              <NewsEmailUser email={user.email} />
            </div>
          </div>

          {hasChanges && (
            <div className="mt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          )}
        </form>

        <div className="w-full max-w-xs flex-col gap-2 border-l pl-8">
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <UploadImageUser
              imageSrc={user.image || ""}
              onImageChange={handleImageChange}
            />
          </div>

          <div className="flex-col flex mt-4 text-center">
            <span className="text-sm text-zinc-400">
              Tamanho do arquivo: no máximo 4MB
            </span>
            <span className="text-sm text-zinc-400">
              Extensão de arquivo: .JPEG, .PNG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormProfile;
