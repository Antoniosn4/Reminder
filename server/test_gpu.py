import torch
print(f"Versão do Torch: {torch.__version__}")
print(f"CUDA disponível? {'✅ SIM' if torch.cuda.is_available() else '❌ NÃO'}")
if torch.cuda.is_available():
    print(f"Placa detectada: {torch.cuda.get_device_name(0)}")