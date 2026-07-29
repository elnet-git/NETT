class OnboardingItem {
  final String title;
  final String description;
  final String image;

  const OnboardingItem({
    required this.title,
    required this.description,
    required this.image,
  });
}


const List<OnboardingItem> onboardingItems = [

  OnboardingItem(
    title: "Muévete fácil por tu ciudad",
    description:
        "Encuentra conductores cercanos y llega a tu destino de forma rápida y segura.",
    image: "assets/images/onboarding1.png",
  ),

  OnboardingItem(
    title: "Solicita viajes y encargos",
    description:
        "Desde un viaje hasta una entrega, NETTMI conecta tus necesidades con personas disponibles.",
    image: "assets/images/onboarding2.png",
  ),

  OnboardingItem(
    title: "Conecta con conductores cercanos",
    description:
        "Recibe seguimiento en tiempo real y mantente conectado durante todo el servicio.",
    image: "assets/images/onboarding3.png",
  ),

];