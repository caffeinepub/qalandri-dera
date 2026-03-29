import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";

actor {
  type MenuItem = {
    name : Text;
    category : Text;
    price : Float;
    description : Text;
    unit : Text;
  };

  let menu = Map.fromIter<Text, MenuItem>(
    [
      (
        "kababRoll",
        {
          name = "Kabab Roll";
          category = "Chicken";
          price = 200.0;
          description = "Spicy chicken kabab wrapped in a paratha.";
          unit = "each";
        },
      ),
      (
        "friedRaahu",
        {
          name = "Fried Rahu";
          category = "Fish";
          price = 550.0;
          description = "Medium-sized fried rahu fish.";
          unit = "500 grams";
        },
      ),
      (
        "naan",
        {
          name = "Naan";
          category = "Sides";
          price = 50.0;
          description = "Traditional Pakistani bread.";
          unit = "each";
        },
      ),
    ].values(),
  );

  public query ({ caller }) func getAllMenuItems() : async [MenuItem] {
    menu.values().toArray();
  };

  public query ({ caller }) func getMenuItemsByCategory(category : Text) : async [MenuItem] {
    menu.values().toArray().filter(
      func(item) { item.category == category }
    );
  };
};
